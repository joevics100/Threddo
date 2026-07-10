"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  reviewSchema,
  type ReviewInput
} from "@/features/trust-safety/schemas/trust-safety.schemas";

export interface ReviewActionResult {
  error?: string;
  success?: boolean;
}

export async function createReviewAction(values: ReviewInput): Promise<ReviewActionResult> {
  const parsed = reviewSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Log in to leave a review." };
  }

  if (user.id === parsed.data.sellerId) {
    return { error: "You can't review your own listing." };
  }

  const { error } = await supabase.from("reviews").insert({
    listing_id: parsed.data.listingId,
    reviewer_id: user.id,
    seller_id: parsed.data.sellerId,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reviewed this listing." };
    }
    return { error: "Couldn't submit your review. Please try again." };
  }

  revalidatePath(`/listings/${parsed.data.listingId}`);
  return { success: true };
}
