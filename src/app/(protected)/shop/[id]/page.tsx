import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Star } from "lucide-react"; 
import ReviewForm from "@/components/reviews/ReviewForm"; 
import { currentUser } from "@clerk/nextjs/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      provider: true,
      reviews: {
        include: {
          user: { 
            select: { 
              name: true, 
              avatarUrl: true // Changed from 'image' to 'avatarUrl'
            } 
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0 
    ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount 
    : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Product Image/Emoji */}
        <div className="h-96 bg-forest-50 rounded-3xl flex items-center justify-center text-9xl border border-forest-500/10">
          {CATEGORY_EMOJI[product.category] ?? "🛒"}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900">{product?.name}</h1>
          <p className="text-forest-500 font-medium mt-2 font-display">
            Sold by {product?.provider?.name ?? "CareCompass Store"}
          </p>
          
          <div className="flex items-center gap-2 mt-4">
            <span className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
            <div className="flex text-yellow-400">
               {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>

          <div className="mt-8">
            <span className="text-3xl font-bold text-forest-600">
                {formatCurrency(product?.price ?? 0)}
            </span>
            <p className="text-sm text-gray-500 mt-1">{product?.stock ?? 0} units available</p>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            {product?.description ?? "No description available."}
          </p>
        </div>
      </div>

      <hr className="my-12 border-gray-200" />

      {/* Reviews Section */}
      <div className="grid md:grid-cols-3 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 font-display">Customer Reviews</h2>
          {user?.id ? (
            <ReviewForm 
              serviceId={product.id} 
              serviceType="PRODUCT" 
              userId={user.id} 
            />
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border">
              Please sign in to leave a review.
            </p>
          )}
        </div>

        <div className="md:col-span-2 space-y-8">
          {product.reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed">
                <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-semibold text-gray-900">
                    {review.user?.name ?? "Anonymous"}
                  </div>
                  <div className="text-yellow-400 text-xs">
                    {"★".repeat(review.rating ?? 0)}{"☆".repeat(5 - (review.rating ?? 0))}
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  {review.content ? `"${review.content}"` : "No comment provided."}
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD: "🦴", TOYS: "🎾", ACCESSORIES: "🐾", MEDICINE: "💊", GROOMING_SUPPLIES: "🪮", OTHER: "🛒",
};