import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) break;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
        },
      });

      // Create notification
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            type: "ORDER_SHIPPED",
            title: "Payment Successful",
            message: `Your order #${orderId.slice(-6).toUpperCase()} has been paid. We'll ship it soon!`,
            link: `/shop/orders/${orderId}`,
          },
        });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
