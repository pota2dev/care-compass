import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Fetch products
  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const lineItems = parsed.data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    return {
      price_data: {
        currency: "usd", // Use USD for Stripe; display BDT to users
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const totalAmount = parsed.data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  // Pre-create order as PENDING
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount,
      status: "PENDING",
      items: {
        create: parsed.data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: products.find((p) => p.id === item.productId)!.price,
        })),
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await createCheckoutSession({
    lineItems,
    successUrl: `${appUrl}/shop/orders/${order.id}?success=true`,
    cancelUrl: `${appUrl}/shop/cart?cancelled=true`,
    metadata: { orderId: order.id, userId: user.id },
    customerEmail: user.email,
  });

  // Save session ID to order
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
