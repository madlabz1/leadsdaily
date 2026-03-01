import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { getPlanByPriceId } from "@/lib/plans";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const planTier = session.metadata?.planTier || "pro";

      if (session.customer_email) {
        await supabase
          .from("users")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
            plan_tier: planTier,
          })
          .eq("email", session.customer_email);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("users")
        .update({ subscription_status: "cancelled", plan_tier: "free" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price?.id;
      const detectedTier = priceId ? getPlanByPriceId(priceId) : null;

      const updateData: Record<string, string> = {
        subscription_status: subscription.status,
      };
      if (detectedTier) {
        updateData.plan_tier = detectedTier;
      }

      await supabase
        .from("users")
        .update(updateData)
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
