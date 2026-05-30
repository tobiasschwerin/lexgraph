import Stripe from "stripe";

export const FREE_MAP_LIMIT = 3;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

// Keep named export for convenience
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export async function getUserSubscription(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.userSubscription.findUnique({ where: { userId } });
}

export async function isPro(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  if (sub.plan !== "pro") return false;
  if (!sub.stripeCurrentPeriodEnd) return false;
  return sub.stripeCurrentPeriodEnd > new Date();
}
