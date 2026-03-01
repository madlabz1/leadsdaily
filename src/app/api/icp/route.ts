import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generateQueries } from "@/lib/ai";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("icp_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  return NextResponse.json({ profile: data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description } = await req.json();

  // Use Claude to generate Exa search queries from the ICP description
  const queries = await generateQueries(description);

  const { data, error } = await supabase
    .from("icp_profiles")
    .insert({
      user_id: user.id,
      description,
      generated_queries: queries,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description } = await req.json();
  const queries = await generateQueries(description);

  const { data, error } = await supabase
    .from("icp_profiles")
    .update({ description, generated_queries: queries, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("active", true)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
