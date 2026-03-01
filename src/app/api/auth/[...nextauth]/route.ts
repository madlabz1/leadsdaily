import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import type { Adapter } from "next-auth/adapters";
import crypto from "crypto";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Minimal adapter that handles verification tokens + user lookup via Supabase
function SupabaseAdapter(): Adapter {
  return {
    async createUser(user) {
      const { data, error } = await supabase
        .from("users")
        .upsert({ email: user.email, name: user.name ?? null }, { onConflict: "email" })
        .select()
        .single();
      if (error) throw error;
      return { id: data.id, email: data.email, emailVerified: null, name: data.name };
    },
    async getUser(id) {
      const { data } = await supabase.from("users").select("*").eq("id", id).single();
      if (!data) return null;
      return { id: data.id, email: data.email, emailVerified: null, name: data.name };
    },
    async getUserByEmail(email) {
      const { data } = await supabase.from("users").select("*").eq("email", email).single();
      if (!data) return null;
      return { id: data.id, email: data.email, emailVerified: null, name: data.name };
    },
    async getUserByAccount() {
      return null;
    },
    async updateUser(user) {
      const { data } = await supabase
        .from("users")
        .update({ name: user.name ?? undefined })
        .eq("id", user.id)
        .select()
        .single();
      if (!data) throw new Error("User not found");
      return { id: data.id, email: data.email, emailVerified: null, name: data.name };
    },
    async linkAccount() { return undefined as never; },
    async createSession() { return undefined as never; },
    async getSessionAndUser() { return null; },
    async updateSession() { return undefined as never; },
    async deleteSession() {},
    async createVerificationToken({ identifier, expires }) {
      const token = crypto.randomBytes(32).toString("hex");
      const { data, error } = await supabase
        .from("verification_tokens")
        .insert({ identifier, token, expires: expires.toISOString() })
        .select()
        .single();
      if (error) throw error;
      return { identifier: data.identifier, token: data.token, expires: new Date(data.expires) };
    },
    async useVerificationToken({ identifier, token }) {
      const { data, error } = await supabase
        .from("verification_tokens")
        .delete()
        .eq("identifier", identifier)
        .eq("token", token)
        .select()
        .single();
      if (error || !data) return null;
      return { identifier: data.identifier, token: data.token, expires: new Date(data.expires) };
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter(),
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: email,
          subject: "Sign in to Leadsdaily",
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #111;">Sign in to Leadsdaily</h2>
              <p style="color: #666;">Click the button below to sign in:</p>
              <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
                Sign in
              </a>
              <p style="color: #999; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user?.email) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (data) {
          (session.user as Record<string, unknown>).id = data.id;
          (session.user as Record<string, unknown>).businessName = data.business_name;
          (session.user as Record<string, unknown>).subscriptionStatus = data.subscription_status;
          (session.user as Record<string, unknown>).planTier = data.plan_tier || "free";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
