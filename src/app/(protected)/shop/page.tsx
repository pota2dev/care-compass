import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ShoppingBag, Star } from "lucide-react";
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
    include: { 
      provider: { select: { name: true } },
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-900">Pet Shop</h1>
          <p className="text-sm text-forest-400/60 mt-1">{products.length} products available</p>
        </div>
        <Link href="/shop/cart" className="inline-flex items-center gap-2 bg-white border border-forest-500/15 text-forest-500 px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-forest-50 hover:shadow-sm transition-all active:scale-95">
          <ShoppingBag className="w-5 h-5" /> Cart
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <Link key={cat.value} href={cat.value === "ALL" ? "/shop" : `/shop?category=${cat.value}`}
            className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
              (category === cat.value || (!category && cat.value === "ALL"))
                ? "bg-forest-500 text-white border-forest-500 shadow-md shadow-forest-500/20"
                : "bg-white text-forest-400/70 border-forest-500/15 hover:border-forest-500/30 hover:bg-forest-50/50"
            }`}>
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const reviewCount = product.reviews.length;
          const avgRating = reviewCount > 0 
            ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount 
            : 0;

          return (
            <div key={product.id} className="group relative bg-white border border-forest-500/10 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-forest-500/5 transition-all duration-300 flex flex-col">
              {/* Product Link wrapper for the Top Section */}
              <Link href={`/shop/${product.id}`} className="flex-1 flex flex-col">
                <div className="h-44 bg-forest-50/50 flex items-center justify-center text-6xl border-b border-forest-500/5 group-hover:bg-forest-50 transition-colors">
                  {CATEGORY_EMOJI[product.category] ?? "🛒"}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] text-forest-500/70 uppercase font-bold tracking-widest">{CATEGORY_LABEL[product.category]}</div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-lg">
                      <Star size={12} className={avgRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      <span className="text-[10px] font-bold text-yellow-700">{avgRating > 0 ? avgRating.toFixed(1) : "0.0"}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-gray-900 mb-1 group-hover:text-forest-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-[11px] text-forest-400/60 mb-3 italic">
                    by {product.provider?.name ?? "CareCompass"}
                  </p>

                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                  )}
                </div>
              </Link>

              {/* Bottom Section (Action Bar) */}
              <div className="px-6 pb-6 mt-auto">
                <div className="flex items-center justify-between pt-4 border-t border-forest-500/5">
                  <div>
                    <span className="font-display text-2xl font-black text-forest-600">{formatCurrency(product.price)}</span>
                    <div className="text-[10px] font-medium text-forest-400/50 mt-0.5">{product.stock} units left</div>
                  </div>
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
                </div>
              </div>
            </div>
          );
        })}
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