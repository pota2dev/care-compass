import { prisma } from "@/lib/prisma";
<<<<<<< HEAD
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ShoppingBag, Star } from "lucide-react";
=======
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { ShoppingBag } from "lucide-react";
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
import type { ProductCategory } from "@prisma/client";

const CATEGORIES: { value: ProductCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Products" },
  { value: "FOOD", label: "Food & Nutrition" },
  { value: "TOYS", label: "Toys" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "GROOMING_SUPPLIES", label: "Grooming" },
];

<<<<<<< HEAD
export default async function ShopPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category as ProductCategory | "ALL" | undefined;
=======
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
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
<<<<<<< HEAD
      ...(category && category !== "ALL" ? { category } : {}),
    },
    include: { 
      provider: { select: { name: true } },
      reviews: true,
    },
=======
      ...(category && category !== ("ALL" as any) ? { category } : {}),
    },
    include: { provider: { select: { name: true } } },
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
    orderBy: { createdAt: "desc" },
  });

  return (
<<<<<<< HEAD
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-900">Pet Shop</h1>
          <p className="text-sm text-forest-400/60 mt-1">{products.length} products available</p>
        </div>
        <Link href="/shop/cart" className="inline-flex items-center gap-2 bg-white border border-forest-500/15 text-forest-500 px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-forest-50 hover:shadow-sm transition-all active:scale-95">
          <ShoppingBag className="w-5 h-5" /> Cart
=======
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
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
        </Link>
      </div>

      {/* Category tabs */}
<<<<<<< HEAD
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <Link key={cat.value} href={cat.value === "ALL" ? "/shop" : `/shop?category=${cat.value}`}
            className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
              (category === cat.value || (!category && cat.value === "ALL"))
                ? "bg-forest-500 text-white border-forest-500 shadow-md shadow-forest-500/20"
                : "bg-white text-forest-400/70 border-forest-500/15 hover:border-forest-500/30 hover:bg-forest-50/50"
            }`}>
=======
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
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
            {cat.label}
          </Link>
        ))}
      </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
      </div>
    </div>
  );
}
<<<<<<< HEAD

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴", TOYS: "🎾", ACCESSORIES: "🐾", MEDICINE: "💊", GROOMING_SUPPLIES: "🪮", OTHER: "🛒",
};
const CATEGORY_LABEL: Record<string, string> = {
  FOOD: "Food & Nutrition", TOYS: "Toys", ACCESSORIES: "Accessories",
  MEDICINE: "Medicine", GROOMING_SUPPLIES: "Grooming", OTHER: "Other",
};
=======
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
