import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: goodLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("feedback", "good");

  const { data: lastRun } = await supabase
    .from("search_runs")
    .select("executed_at")
    .eq("user_id", user.id)
    .order("executed_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    totalLeads: totalLeads || 0,
    goodLeads: goodLeads || 0,
    lastRun: lastRun?.executed_at
      ? new Date(lastRun.executed_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  });
}
