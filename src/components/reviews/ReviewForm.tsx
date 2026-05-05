"use client"

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/reviews";
import { ServiceType } from "@prisma/client";

interface ReviewFormProps {
  serviceId: string;
  serviceType: ServiceType;
  userId: string;
}

export default function ReviewForm({ serviceId, serviceType, userId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="max-w-md p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
      
      <form action={submitReview} className="space-y-4">
        {/* Star Rating Logic */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none transition-transform active:scale-90"
            >
              <Star
                size={28}
                className={`${
                  (hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        {/* Hidden inputs to send data to the Server Action */}
        <input type="hidden" name="rating" value={rating} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="serviceType" value={serviceType} />
        <input type="hidden" name="userId" value={userId} />

        <textarea
          name="comment"
          required
          placeholder="Share your experience..."
          className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full bg-blue-600 disabled:bg-slate-400 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}