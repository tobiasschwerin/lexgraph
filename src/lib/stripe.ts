import Stripe from "stripe";

export const FREE_MAP_LIMIT = 3;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

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
