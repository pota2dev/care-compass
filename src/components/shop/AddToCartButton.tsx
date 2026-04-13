"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "./CartContext";

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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      onClick={handleAdd}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all"
      style={
        added
          ? {
              backgroundColor: "#2D5016",
              color: "#fff",
              borderColor: "#2D5016",
            }
          : {
              backgroundColor: "#FAF7F2",
              color: "#2D5016",
              borderColor: "rgba(45,80,22,0.3)",
            }
      }
    >
      {added ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <ShoppingCart className="w-3.5 h-3.5" />
      )}
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
