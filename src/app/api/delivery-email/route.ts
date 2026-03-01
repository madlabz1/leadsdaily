import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("delivery_emails")
    .select("*")
    .eq("user_id", user.id);

  return NextResponse.json({ emails: data || [] });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();
  const token = crypto.randomBytes(32).toString("hex");

  const { data, error } = await supabase
    .from("delivery_emails")
    .insert({
      user_id: user.id,
      email_address: email,
      verified: false,
      verification_token: token,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send verification email
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Verify your email for LeadGen",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111;">Verify your email</h2>
        <p style="color: #666;">Click below to confirm you want to receive daily leads at this address:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify email
        </a>
      </div>
    `,
  });

  return NextResponse.json({ email: data });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await supabase
    .from("delivery_emails")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
