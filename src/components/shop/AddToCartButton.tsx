"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    imageEmoji: string;
    category: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleAdd() {
    // Read cart from localStorage directly — no context needed
    try {
      const raw = localStorage.getItem("carecompass_cart");
      const cart: any[] = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("carecompass_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch {}

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (!mounted) {
    return (
      <div className="w-24 h-8 rounded-full"
        style={{ backgroundColor: "rgba(45,80,22,0.08)" }} />
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all"
      style={
        added
          ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
          : { backgroundColor: "#FAF7F2", color: "#2D5016", borderColor: "rgba(45,80,22,0.3)" }
      }
    >
      {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
