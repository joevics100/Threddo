"use client";

import { useState, useTransition } from "react";

import { Heart } from "lucide-react";

import { toggleSavedListingAction } from "@/features/listings/actions/saved.actions";

interface SaveButtonProps {
  listingId: string;
  initialSaved: boolean;
}

export function SaveButton({ listingId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    // Prevent the click from bubbling to a wrapping <Link> (cards link to the
    // listing detail page).
    e.preventDefault();
    e.stopPropagation();

    const optimistic = !saved;
    setSaved(optimistic);

    startTransition(async () => {
      const result = await toggleSavedListingAction(listingId);
      if (result.error) {
        setSaved(!optimistic); // revert on failure
      } else if (typeof result.saved === "boolean") {
        setSaved(result.saved);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Remove from saved" : "Save this listing"}
      aria-pressed={saved}
      className="rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition hover:bg-white"
    >
      <Heart
        className={saved ? "size-4 fill-[#E8543D] text-[#E8543D]" : "size-4 text-[#1B1F3B]/60"}
      />
    </button>
  );
}
