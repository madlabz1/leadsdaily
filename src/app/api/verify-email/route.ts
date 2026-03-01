import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("delivery_emails")
    .update({ verified: true, verification_token: null })
    .eq("verification_token", token)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/dashboard/settings?verified=error", req.url));
  }

  return NextResponse.redirect(new URL("/dashboard/settings?verified=success", req.url));
}
