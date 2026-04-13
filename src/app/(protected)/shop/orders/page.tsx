import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

function getDeliveryStatus(order: {
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  if (order.status === "CANCELLED")
    return { label: "Cancelled", color: "#C8593A", bg: "#F9EDE8", emoji: "❌" };
  if (order.status === "DELIVERED")
    return { label: "Delivered", color: "#2D5016", bg: "#C8DFB0", emoji: "✅" };

  const now = Date.now();
  const placed = new Date(order.createdAt).getTime();
  const elapsedHours = (now - placed) / (1000 * 60 * 60);

  if (elapsedHours < 0.5)
    return {
      label: "Order Placed",
      color: "#4A7C28",
      bg: "#F2F7EC",
      emoji: "📦",
    };
  if (elapsedHours < 1)
    return {
      label: "Processing",
      color: "#C47A10",
      bg: "#FDF0D5",
      emoji: "⚙️",
    };
  if (elapsedHours < 2)
    return {
      label: "Out for Delivery",
      color: "#3A7AB5",
      bg: "#E3EFF8",
      emoji: "🚚",
    };
  if (elapsedHours < 5)
    return {
      label: "On the Way",
      color: "#3A7AB5",
      bg: "#E3EFF8",
      emoji: "🛵",
    };
  return { label: "Delivered", color: "#2D5016", bg: "#C8DFB0", emoji: "✅" };
}

export default async function OrdersPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: { select: { name: true, category: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#2D5016" }}
        >
          <ShoppingBag className="w-4 h-4" /> Shop More
        </Link>
      </div>

      {orders.length === 0 ? (
        <div
          className="bg-white border border-dashed rounded-2xl p-16 text-center"
          style={{ borderColor: "rgba(45,80,22,0.2)" }}
        >
          <ShoppingBag
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "rgba(45,80,22,0.2)" }}
          />
          <h3 className="font-display text-xl font-semibold mb-2">
            No orders yet
          </h3>
          <p className="text-sm mb-6" style={{ color: "#8A9480" }}>
            Your order history will appear here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#2D5016" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const delivery = getDeliveryStatus(order);
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <Link
                key={order.id}
                href={`/shop/orders/${order.id}`}
                className="block bg-white border rounded-2xl p-5 hover:shadow-md transition-all group"
                style={{ borderColor: "rgba(45,80,22,0.1)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: delivery.bg,
                          color: delivery.color,
                        }}
                      >
                        {delivery.emoji} {delivery.label}
                      </span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: "#8A9480" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs" style={{ color: "#8A9480" }}>
                      {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                      {order.items
                        .slice(0, 2)
                        .map((i) => i.product.name)
                        .join(", ")}
                      {order.items.length > 2
                        ? ` +${order.items.length - 2} more`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-display text-xl font-bold"
                      style={{ color: "#2D5016" }}
                    >
                      ৳ {order.totalAmount.toLocaleString()}
                    </p>
                    <ArrowRight
                      className="w-4 h-4 ml-auto mt-1 opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#2D5016" }}
                    />
                  </div>
                </div>

                {/* Delivery progress bar */}
                <DeliveryBar
                  createdAt={order.createdAt}
                  status={order.status}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeliveryBar({
  createdAt,
  status,
}: {
  createdAt: Date;
  status: string;
}) {
  if (status === "CANCELLED") return null;

  const now = Date.now();
  const placed = new Date(createdAt).getTime();
  const elapsedHours = (now - placed) / (1000 * 60 * 60);
  const totalHours = 3.5; // midpoint of 2–5 hours
  const pct = Math.min(100, Math.round((elapsedHours / totalHours) * 100));

  const steps = [
    { label: "Placed", threshold: 0 },
    { label: "Processing", threshold: 15 },
    { label: "Out for Delivery", threshold: 40 },
    { label: "Delivered", threshold: 100 },
  ];

  return (
    <div
      className="mt-4 pt-4"
      style={{ borderTop: "1px solid rgba(45,80,22,0.08)" }}
    >
      <div
        className="flex justify-between text-[10px] mb-1.5"
        style={{ color: "#8A9480" }}
      >
        {steps.map((s) => (
          <span
            key={s.label}
            style={{
              color: pct >= s.threshold ? "#2D5016" : "#8A9480",
              fontWeight: pct >= s.threshold ? 500 : 400,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: "#F2F7EC" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? "#2D5016" : "#4A7C28",
          }}
        />
      </div>
    </div>
  );
}
