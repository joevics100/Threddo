"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ListingCondition } from "@/types/database.types";

import { Button } from "@/ui";
import { formatNaira, getConditionLabel } from "@/features/listings/lib/format";
import {
  approveListingAction,
  rejectListingAction
} from "@/features/trust-safety/actions/admin.actions";

export interface ModerationListing {
  id: string;
  title: string;
  price: number | null;
  is_free: boolean;
  condition: ListingCondition;
  state: string | null;
  lga: string | null;
  images: string[];
  created_at: string;
  category_name: string | null;
  seller_name: string | null;
  rejection_reason?: string | null;
}

export function ListingModerationRow({ listing }: { listing: ModerationListing }) {
  const [isPending, startTransition] = useTransition();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveListingAction(listing.id);
      if (result.error) setError(result.error);
      else setDone(true);
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectListingAction(listing.id, reason);
      if (result.error) setError(result.error);
      else setDone(true);
    });
  }

  if (done) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 sm:flex-row">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-black/5">
        {listing.images?.[0] ? (
          <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
        ) : null}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/listings/${listing.id}`}
              target="_blank"
              className="font-semibold text-[#1B1F3B] hover:underline"
            >
              {listing.title}
            </Link>
            <p className="text-sm text-black/60">
              {formatNaira(listing.is_free ? null : listing.price)} ·{" "}
              {getConditionLabel(listing.condition)} ·{" "}
              {[listing.lga, listing.state].filter(Boolean).join(", ")}
            </p>
            <p className="text-xs text-black/40">
              {listing.category_name ?? "Uncategorized"} · by {listing.seller_name ?? "Unknown"}
            </p>
          </div>
        </div>

        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

        {showRejectInput ? (
          <div className="mt-3 grid gap-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Reason for rejection (shown to the seller)"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isPending}
              >
                Confirm reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowRejectInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleApprove}
              disabled={isPending}
              className="bg-[#1B1F3B] text-white hover:bg-[#2a2f5a]"
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowRejectInput(true)}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
