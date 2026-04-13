"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/shop/cart"
      className="relative p-2 rounded-xl transition-colors hover:bg-[#FAF7F2]"
    >
      <ShoppingCart className="w-5 h-5" style={{ color: "#4A7C28" }} />
      {totalItems > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: "#C8593A" }}
        >
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
