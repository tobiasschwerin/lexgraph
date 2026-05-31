import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const sub = await prisma.userSubscription.findUnique({ where: { stripeCustomerId: customerId } });
    if (sub) {
      await prisma.userSubscription.update({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: subscriptionId,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          plan: "pro",
        },
      });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = (invoice as { subscription?: string }).subscription;
    if (!subscriptionId) return NextResponse.json({ ok: true });
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await prisma.userSubscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
        plan: "pro",
      },
    });
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.paused") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.userSubscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { plan: "free", stripeCurrentPeriodEnd: null },
    });
  }

  return NextResponse.json({ ok: true });
}
