import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
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

export default async function ShopPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category as ProductCategory | "ALL" | undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(category && category !== "ALL" ? { category } : {}),
    },
    include: { provider: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Pet Shop</h1>
          <p className="text-sm text-forest-400/60 mt-1">{products.length} products available</p>
        </div>
        <Link href="/shop/cart" className="inline-flex items-center gap-2 bg-white border border-forest-500/15 text-forest-500 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-50 transition-all">
          <ShoppingBag className="w-4 h-4" /> Cart
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.value} href={cat.value === "ALL" ? "/shop" : `/shop?category=${cat.value}`}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              (category === cat.value || (!category && cat.value === "ALL"))
                ? "bg-forest-500 text-white border-forest-500"
                : "bg-white text-forest-400/70 border-forest-500/15 hover:border-forest-500/30"
            }`}>
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-forest-500/10 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
            <div className="h-32 bg-forest-50 flex items-center justify-center text-5xl border-b border-forest-500/8">
              {CATEGORY_EMOJI[product.category] ?? "🛒"}
            </div>
            <div className="p-5">
              <div className="text-[10px] text-forest-400/50 uppercase tracking-wider mb-1">{CATEGORY_LABEL[product.category]}</div>
              <h3 className="font-display text-base font-semibold text-gray-900 mb-1 group-hover:text-forest-500 transition-colors">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-xs text-forest-400/60 line-clamp-2 mb-3">{product.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="font-display text-xl font-bold text-forest-500">{formatCurrency(product.price)}</span>
                  <div className="text-[10px] text-forest-400/50 mt-0.5">{product.stock} in stock</div>
                </div>
                <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴", TOYS: "🎾", ACCESSORIES: "🐾", MEDICINE: "💊", GROOMING_SUPPLIES: "🪮", OTHER: "🛒",
};
const CATEGORY_LABEL: Record<string, string> = {
  FOOD: "Food & Nutrition", TOYS: "Toys", ACCESSORIES: "Accessories",
  MEDICINE: "Medicine", GROOMING_SUPPLIES: "Grooming", OTHER: "Other",
};
