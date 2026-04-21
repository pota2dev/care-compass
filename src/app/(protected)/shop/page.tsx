import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ShoppingBag } from "lucide-react";
import type { ProductCategory } from "@prisma/client";

const CATEGORIES: { value: ProductCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Products" },
  { value: "FOOD", label: "Food & Nutrition" },
  { value: "TOYS", label: "Toys" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "GROOMING_SUPPLIES", label: "Grooming" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴",
  TOYS: "🎾",
  ACCESSORIES: "🐾",
  MEDICINE: "💊",
  GROOMING_SUPPLIES: "🪮",
  OTHER: "🛒",
};

const CATEGORY_LABEL: Record<string, string> = {
  FOOD: "Food & Nutrition",
  TOYS: "Toys",
  ACCESSORIES: "Accessories",
  MEDICINE: "Medicine",
  GROOMING_SUPPLIES: "Grooming",
  OTHER: "Other",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>; // ✅ Next.js 15: Promise type
}) {
  const { category: rawCategory } = await searchParams; // ✅ await before use
  const category = rawCategory as ProductCategory | undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(category && category !== ("ALL" as any) ? { category } : {}),
    },
    include: { provider: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Pet Shop
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8A9480" }}>
            {products.length} products available
          </p>
        </div>
        <Link
          href="/shop/cart"
          className="inline-flex items-center gap-2 bg-white border px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[#F2F7EC]"
          style={{ borderColor: "rgba(45,80,22,0.15)", color: "#2D5016" }}
        >
          <ShoppingBag className="w-4 h-4" /> View Cart
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === "ALL" ? "/shop" : `/shop?category=${cat.value}`}
            className="px-4 py-2 rounded-full text-xs font-medium border transition-all"
            style={
              category === cat.value || (!category && cat.value === "ALL")
                ? {
                    backgroundColor: "#2D5016",
                    color: "#fff",
                    borderColor: "#2D5016",
                  }
                : {
                    backgroundColor: "#fff",
                    color: "rgba(45,80,22,0.7)",
                    borderColor: "rgba(45,80,22,0.15)",
                  }
            }
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all group"
            style={{ borderColor: "rgba(45,80,22,0.1)" }}
          >
            <div
              className="h-32 flex items-center justify-center text-5xl border-b"
              style={{
                backgroundColor: "#FAF7F2",
                borderColor: "rgba(45,80,22,0.08)",
              }}
            >
              {CATEGORY_EMOJI[product.category] ?? "🛒"}
            </div>
            <div className="p-5">
              <div
                className="text-[10px] uppercase tracking-wider mb-1"
                style={{ color: "#8A9480" }}
              >
                {CATEGORY_LABEL[product.category]}
              </div>
              <h3 className="font-display text-base font-semibold text-gray-900 mb-1 group-hover:text-[#2D5016] transition-colors">
                {product.name}
              </h3>
              {product.description && (
                <p
                  className="text-xs line-clamp-2 mb-3"
                  style={{ color: "#8A9480" }}
                >
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span
                    className="font-display text-xl font-bold"
                    style={{ color: "#2D5016" }}
                  >
                    ৳ {product.price.toLocaleString()}
                  </span>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: "#8A9480" }}
                  >
                    {product.stock} in stock
                  </div>
                </div>
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageEmoji: CATEGORY_EMOJI[product.category] ?? "🛒",
                    category: CATEGORY_LABEL[product.category],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
