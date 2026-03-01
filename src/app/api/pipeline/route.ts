import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchLeads, deduplicateResults } from "@/lib/exa";
import { scoreLeads } from "@/lib/ai";
import { buildLeadDigestHtml } from "@/lib/email-templates";
import { getPlanForUser } from "@/lib/plans";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{ userId: string; status: string; leadsFound: number }> = [];

  // Get all active users with ICP profiles
  const { data: profiles } = await supabase
    .from("icp_profiles")
    .select("*, users(*)")
    .eq("active", true);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No active profiles", results: [] });
  }

  for (const profile of profiles) {
    try {
      const user = profile.users as unknown as {
        id: string;
        email: string;
        business_name: string;
        subscription_status: string | null;
        plan_tier: string | null;
      };

      // Get the user's plan and lead limit
      const plan = getPlanForUser(user.subscription_status, user.plan_tier);
      const leadLimit = plan.leadsPerDay;

      // Step 1: Search with Exa
      const rawResults = await searchLeads(profile.generated_queries as string[]);

      // Step 2: Deduplicate
      const deduped = deduplicateResults(rawResults);

      // Step 3: Remove previously sent leads
      const { data: existingLeads } = await supabase
        .from("leads")
        .select("company_url")
        .eq("user_id", user.id);

      const existingUrls = new Set(existingLeads?.map((l) => {
        try { return new URL(l.company_url).hostname.replace("www.", ""); } catch { return l.company_url; }
      }) || []);

      const newResults = deduped.filter((r) => {
        try {
          const domain = new URL(r.company_url).hostname.replace("www.", "");
          return !existingUrls.has(domain);
        } catch { return true; }
      });

      // Step 4: Score with AI
      const scored = await scoreLeads(newResults.slice(0, 30), profile.description);

      // Step 5: Pick top leads based on plan limit
      const topLeads = scored
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, leadLimit);

      // Step 6: Save leads to database
      const now = new Date().toISOString();
      const leadsToInsert = topLeads.map((lead) => ({
        user_id: user.id,
        icp_profile_id: profile.id,
        company_name: lead.company_name,
        company_url: lead.company_url,
        description: lead.description,
        signals: lead.signals,
        relevance_score: lead.relevance_score,
        source_query: lead.signals?.source_query || "",
        delivered_at: now,
        feedback: null,
      }));

      if (leadsToInsert.length > 0) {
        await supabase.from("leads").insert(leadsToInsert);
      }

      // Step 7: Log search run
      await supabase.from("search_runs").insert({
        user_id: user.id,
        icp_profile_id: profile.id,
        executed_at: now,
        query_count: (profile.generated_queries as string[]).length,
        result_count: topLeads.length,
        status: "success",
      });

      // Step 8: Send email to verified delivery addresses
      const { data: emails } = await supabase
        .from("delivery_emails")
        .select("*")
        .eq("user_id", user.id)
        .eq("verified", true);

      if (emails && emails.length > 0 && topLeads.length > 0) {
        const html = buildLeadDigestHtml(
          leadsToInsert as never,
          user.business_name || "Your Business"
        );

        for (const emailRecord of emails) {
          await getResend().emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: emailRecord.email_address,
            subject: `Your daily leads — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            html,
          });
        }
      }

      results.push({ userId: user.id, status: "success", leadsFound: topLeads.length });
    } catch (error) {
      console.error(`Pipeline failed for profile ${profile.id}:`, error);

      await supabase.from("search_runs").insert({
        user_id: profile.user_id,
        icp_profile_id: profile.id,
        executed_at: new Date().toISOString(),
        query_count: 0,
        result_count: 0,
        status: "failed",
      });

      results.push({ userId: profile.user_id, status: "failed", leadsFound: 0 });
    }
  }

  return NextResponse.json({ results });
}
