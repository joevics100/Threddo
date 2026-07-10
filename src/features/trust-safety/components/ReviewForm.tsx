"use client";

import { useState, useTransition } from "react";

import { Button } from "@/ui";
import { createReviewAction } from "@/features/trust-safety/actions/review.actions";
import { StarRating } from "@/features/trust-safety/components/StarRating";

interface ReviewFormProps {
  listingId: string;
  sellerId: string;
}

export function ReviewForm({ listingId, sellerId }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Select a rating");
      return;
    }

    startTransition(async () => {
      const result = await createReviewAction({ listingId, sellerId, rating, comment });
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return <p className="text-sm text-[#1B1F3B]/70">Thanks for your review!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="How was your experience with this seller? (optional)"
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={isPending}
        className="w-fit bg-[#1B1F3B] text-white hover:bg-[#2a2f5a]"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
