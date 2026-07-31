"use client";

import { useTransition } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/ui";
import { deleteListingAction } from "@/features/listings/actions/listing.actions";

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle: string;
}

export function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label={`Delete ${listingTitle}`}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{listingTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the listing and its photos for good — buyers won&apos;t be able to find it
            anymore. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
