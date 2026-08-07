"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { setListingSoldAction } from "@/features/listings/actions/listing.actions";

interface MarkSoldButtonProps {
  listingId: string;
  isSold: boolean;
}

export function MarkSoldButton({ listingId, isSold }: MarkSoldButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await setListingSoldAction(listingId, !isSold);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isSold ? "Listing marked as available again." : "Listing marked as sold.");
      router.refresh();
    });
  }

  if (isSold) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#1B1F3B] transition hover:bg-black/5 disabled:opacity-50"
      >
        <RotateCcw className="size-3.5" />
        {isPending ? "Updating…" : "Mark as available"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
    >
      <CheckCircle2 className="size-3.5" />
      {isPending ? "Updating…" : "Mark as sold"}
    </button>
  );
}
