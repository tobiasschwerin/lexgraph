import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export const FREE_MAP_LIMIT = 3;

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
