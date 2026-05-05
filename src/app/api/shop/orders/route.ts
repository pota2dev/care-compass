import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { select: { name: true, category: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    // Get both auth and currentUser in parallel
    const [{ userId: clerkId }, clerkUser] = await Promise.all([
      auth(),
      currentUser(),
    ]);

    if (!clerkId || !clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Always use the email directly from Clerk — this is the login email
    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const clerkName  = clerkUser.fullName ?? clerkUser.firstName ?? "there";

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { items, totalAmount, shippingAddress, firstName, lastName, phone } = body;

    if (!items?.length)   return NextResponse.json({ error: "No items in order" },  { status: 400 });
    if (!shippingAddress) return NextResponse.json({ error: "Address required" },    { status: 400 });
    if (!firstName)       return NextResponse.json({ error: "First name required" }, { status: 400 });
    if (!phone)           return NextResponse.json({ error: "Phone required" },      { status: 400 });

    const fullAddress = `${firstName} ${lastName} · ${phone} · ${shippingAddress}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId:          user.id,
          totalAmount,
          shippingAddress: fullAddress,
          status:          "PROCESSING",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { name: true } } } },
        },
      });

      for (const item of items) {
        await tx.product.updateMany({
          where: { id: item.productId, stock: { gt: 0 } },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      await tx.notification.create({
        data: {
          userId:  user.id,
          type:    "ORDER_SHIPPED",
          title:   "Order Placed!",
          message: `Order #${newOrder.id.slice(-8).toUpperCase()} confirmed. Delivery in 2–5 hours.`,
          link:    `/shop/orders/${newOrder.id}`,
        },
      });

      return newOrder;
    });

    // Send to Clerk email address directly
    sendOrderConfirmationEmail({
      to:       clerkEmail,   // ← Clerk login email
      userName: clerkName,
      orderId:  order.id,
      items:    order.items.map((i) => ({
        name:      i.product.name,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      })),
      totalAmount,
      shippingAddress: fullAddress,
    }).catch((err) => console.error("Order email error:", err));

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
console.log("Resend key loaded:", !!process.env.RESEND_API_KEY);
