import { timeAgo } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

import { StarRating } from "@/features/trust-safety/components/StarRating";

interface SellerReviewsProps {
  sellerId: string;
}

export async function SellerReviews({ sellerId }: SellerReviewsProps) {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name)"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-black/50">No reviews yet for this seller.</p>;
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <StarRating value={average} />
        <span className="text-sm text-black/60">
          {average.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
        </span>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-t border-black/5 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1B1F3B]">
                {review.reviewer?.full_name ?? "Threddo user"}
              </span>
              <span className="text-xs text-black/40">{timeAgo(review.created_at)}</span>
            </div>
            <StarRating value={review.rating} size={14} />
            {review.comment ? <p className="mt-1 text-sm text-black/70">{review.comment}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
