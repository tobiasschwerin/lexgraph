import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // Get or create Stripe customer
  let sub = await prisma.userSubscription.findUnique({ where: { userId } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    sub = await prisma.userSubscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/library?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/library`,
  });

  return NextResponse.json({ url: session.url });
}
