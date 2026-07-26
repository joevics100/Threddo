"use client";

import { useTransition } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteListingAction } from "@/features/listings/actions/listing.actions";

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle: string;
}

export function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${listingTitle}"? This can't be undone.`);
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteListingAction(listingId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Listing deleted.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${listingTitle}`}
      className="flex items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
    >
      <Trash2 className="size-3.5" />
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
