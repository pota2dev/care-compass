"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  function readCount() {
    try {
      const raw = localStorage.getItem("carecompass_cart");
      const cart: { quantity: number }[] = raw ? JSON.parse(raw) : [];
      setCount(cart.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    readCount();
    window.addEventListener("cart-updated", readCount);
    return () => window.removeEventListener("cart-updated", readCount);
  }, []);

  return (
    <Link href="/shop/cart" className="relative p-2 rounded-xl transition-colors hover:bg-[#FAF7F2]">
      <ShoppingCart className="w-5 h-5" style={{ color: "#4A7C28" }} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: "#C8593A" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
