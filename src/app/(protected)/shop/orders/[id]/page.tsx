import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import LiveDeliveryTracker from "@/components/shop/LiveDeliveryTracker";

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴",
  TOYS: "🎾",
  ACCESSORIES: "🐾",
  MEDICINE: "💊",
  GROOMING_SUPPLIES: "🪮",
  OTHER: "🛒",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { new?: string };
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!user) return null;

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, category: true, description: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const isNew = searchParams.new === "true";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/shop/orders"
          className="p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#2D5016" }} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#8A9480" }}>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Success banner for new orders */}
      {isNew && (
        <div
          className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ backgroundColor: "#2D5016" }}
        >
          <div className="text-3xl">🎉</div>
          <div>
            <p className="font-semibold text-white">
              Order placed successfully!
            </p>
            <p
              className="text-sm mt-0.5"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Your items will be delivered within 2–5 hours.
            </p>
          </div>
        </div>
      )}

      {/* Live delivery tracker */}
      <LiveDeliveryTracker
        orderId={order.id}
        createdAt={order.createdAt.toISOString()}
        status={order.status}
      />

      {/* Delivery address */}
      {order.shippingAddress && (
        <div
          className="bg-white border rounded-2xl p-5 mb-4"
          style={{ borderColor: "rgba(45,80,22,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" style={{ color: "#4A7C28" }} />
            <h2 className="font-display text-base font-semibold">
              Delivery Address
            </h2>
          </div>
          <p className="text-sm" style={{ color: "#4A7C28" }}>
            {order.shippingAddress}
          </p>
        </div>
      )}

      {/* Order items */}
      <div
        className="bg-white border rounded-2xl p-5 mb-4"
        style={{ borderColor: "rgba(45,80,22,0.1)" }}
      >
        <h2 className="font-display text-base font-semibold mb-4">
          Items Ordered
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: "#FAF7F2" }}
              >
                {CATEGORY_EMOJI[item.product.category] ?? "🛒"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8A9480" }}>
                  Qty: {item.quantity} × ৳ {item.unitPrice.toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-bold" style={{ color: "#2D5016" }}>
                ৳ {(item.quantity * item.unitPrice).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-4 pt-4 flex justify-between text-base font-bold"
          style={{ borderTop: "1px solid rgba(45,80,22,0.1)" }}
        >
          <span>Total</span>
          <span style={{ color: "#2D5016" }}>
            ৳ {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href="/shop"
        className="block w-full text-center py-3 rounded-xl text-sm font-medium border transition-all"
        style={{ borderColor: "rgba(45,80,22,0.2)", color: "#2D5016" }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
