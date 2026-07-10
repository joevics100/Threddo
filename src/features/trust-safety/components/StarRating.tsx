"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

/**
 * Renders 5 stars. Pass `onChange` to make it an interactive picker (used in
 * the review form); omit it for a read-only display (e.g. average rating).
 */
export function StarRating({ value, onChange, size = 20 }: StarRatingProps) {
  const isInteractive = Boolean(onChange);

  return (
    <div className="flex gap-1" role={isInteractive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={cn(!isInteractive && "cursor-default")}
        >
          <Star
            size={size}
            className={
              star <= Math.round(value) ? "fill-[#E8A33D] text-[#E8A33D]" : "text-black/20"
            }
          />
        </button>
      ))}
    </div>
  );
}
