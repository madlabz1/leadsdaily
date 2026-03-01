export type PlanTier = "free" | "pro" | "business";

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  price: number;
  leadsPerDay: number;
  maxIcpProfiles: number;
  features: string[];
  stripePriceId: string | null;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Free",
    tier: "free",
    price: 0,
    leadsPerDay: 3,
    maxIcpProfiles: 1,
    features: [
      "3 leads per day",
      "1 ICP profile",
      "Daily email digest",
      "Lead scoring",
      "Basic deduplication",
    ],
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    tier: "pro",
    price: 49,
    leadsPerDay: 10,
    maxIcpProfiles: 1,
    features: [
      "10 leads per day",
      "1 ICP profile",
      "Daily email digest",
      "Lead scoring & deduplication",
      "Feedback loop to improve results",
      "Lead history & export",
    ],
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || "",
  },
  business: {
    name: "Business",
    tier: "business",
    price: 99,
    leadsPerDay: 25,
    maxIcpProfiles: 3,
    features: [
      "25 leads per day",
      "3 ICP profiles",
      "Daily email digest",
      "Lead scoring & deduplication",
      "Feedback loop to improve results",
      "Lead history & export",
      "Priority support",
    ],
    stripePriceId: process.env.STRIPE_PRICE_ID_BUSINESS || "",
  },
};

export function getPlanForUser(subscriptionStatus: string | null, planTier: string | null): PlanConfig {
  if (subscriptionStatus === "active" && planTier && planTier in PLANS) {
    return PLANS[planTier as PlanTier];
  }
  return PLANS.free;
}

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) return tier as PlanTier;
  }
  return null;
}
