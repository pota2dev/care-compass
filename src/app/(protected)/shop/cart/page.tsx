"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/shop/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  User,
  Phone,
} from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } =
    useCart();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid phone number";
    if (!form.address.trim())
      newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCheckout() {
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          totalAmount: totalPrice,
          shippingAddress: form.address,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      clearCart();
      router.push(`/shop/orders/${data.orderId}?new=true`);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Empty cart ────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <ShoppingBag
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: "rgba(45,80,22,0.2)" }}
        />
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm mb-6" style={{ color: "#8A9480" }}>
          Add some products from the shop to get started.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#2D5016" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Your Cart
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "#4A7C28" }}
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Cart items ── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-2xl p-4 flex items-center gap-4"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: "#FAF7F2" }}
              >
                {item.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#8A9480" }}>
                  {item.category}
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: "#2D5016" }}
                >
                  ৳ {item.price.toLocaleString()}
                </p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border hover:bg-[#FAF7F2] transition-all"
                  style={{ borderColor: "rgba(45,80,22,0.2)" }}
                >
                  <Minus className="w-3 h-3" style={{ color: "#2D5016" }} />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border hover:bg-[#FAF7F2] transition-all"
                  style={{ borderColor: "rgba(45,80,22,0.2)" }}
                >
                  <Plus className="w-3 h-3" style={{ color: "#2D5016" }} />
                </button>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-gray-900">
                  ৳ {(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-1 p-1 rounded-lg hover:bg-[#F9EDE8] transition-colors"
                >
                  <Trash2
                    className="w-3.5 h-3.5"
                    style={{ color: "#C8593A" }}
                  />
                </button>
              </div>
            </div>
          ))}

          {/* ── Delivery details form ── */}
          <div
            className="bg-white border rounded-2xl p-5 mt-2"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}
          >
            <h2 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: "#4A7C28" }} />
              Delivery Details
            </h2>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#4A7C28" }}
                >
                  First Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: "#8A9480" }}
                  />
                  <input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Rahim"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm text-gray-900 outline-none transition-all"
                    style={{
                      borderColor: errors.firstName
                        ? "#C8593A"
                        : "rgba(45,80,22,0.15)",
                    }}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[10px] mt-1" style={{ color: "#C8593A" }}>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#4A7C28" }}
                >
                  Last Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: "#8A9480" }}
                  />
                  <input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Hossain"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm text-gray-900 outline-none transition-all"
                    style={{
                      borderColor: errors.lastName
                        ? "#C8593A"
                        : "rgba(45,80,22,0.15)",
                    }}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[10px] mt-1" style={{ color: "#C8593A" }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#4A7C28" }}
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#8A9480" }}
                />
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="01700-123456"
                  className="w-full pl-8 pr-3 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm text-gray-900 outline-none transition-all"
                  style={{
                    borderColor: errors.phone
                      ? "#C8593A"
                      : "rgba(45,80,22,0.15)",
                  }}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] mt-1" style={{ color: "#C8593A" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#4A7C28" }}
              >
                Delivery Address *
              </label>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={3}
                placeholder="House no, Road no, Area, City..."
                className="w-full bg-[#FAF7F2] border rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none resize-none transition-all"
                style={{
                  borderColor: errors.address
                    ? "#C8593A"
                    : "rgba(45,80,22,0.15)",
                }}
              />
              {errors.address && (
                <p className="text-[10px] mt-1" style={{ color: "#C8593A" }}>
                  {errors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="space-y-4">
          <div
            className="bg-white border rounded-2xl p-5"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}
          >
            <h2 className="font-display text-lg font-semibold mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span style={{ color: "#4A7C28" }} className="truncate mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    ৳ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="border-t pt-3 flex justify-between text-base font-bold"
              style={{ borderColor: "rgba(45,80,22,0.1)" }}
            >
              <span>Total</span>
              <span style={{ color: "#2D5016" }}>
                ৳ {totalPrice.toLocaleString()}
              </span>
            </div>
            <div
              className="mt-3 text-xs px-3 py-2 rounded-xl"
              style={{ backgroundColor: "#F2F7EC", color: "#4A7C28" }}
            >
              🚚 Estimated delivery: 2–5 hours after order
            </div>
          </div>

          {apiError && (
            <div
              className="text-sm px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#F9EDE8", color: "#C8593A" }}
            >
              {apiError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: "#2D5016" }}
          >
            {loading
              ? "Placing Order..."
              : `Place Order · ৳ ${totalPrice.toLocaleString()}`}
          </button>

          <p className="text-[10px] text-center" style={{ color: "#8A9480" }}>
            Cash on delivery · No payment needed now
          </p>
        </div>
      </div>
    </div>
  );
}
