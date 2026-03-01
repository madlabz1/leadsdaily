import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, type PlanTier } from "@/lib/plans";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await req.json()) as { plan?: string };
  const tier = (plan === "pro" || plan === "business" ? plan : "pro") as PlanTier;
  const planConfig = PLANS[tier];

  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const session = await getStripe().checkout.sessions.create({
    customer_email: user.email,
    mode: "subscription",
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    metadata: { userId: user.id, planTier: tier },
  });

  return NextResponse.json({ url: session.url });
}
