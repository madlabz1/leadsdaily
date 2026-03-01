import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: email,
          subject: "Sign in to LeadGen",
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #111;">Sign in to LeadGen</h2>
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
    async signIn({ user }) {
      if (!user.email) return false;

      // Upsert user in our database
      const { error } = await supabase
        .from("users")
        .upsert({ email: user.email, name: user.name ?? null }, { onConflict: "email" });

      if (error) {
        console.error("Error upserting user:", error);
      }
      return true;
    },
    async session({ session }) {
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
