"use client";

import Image from "next/image";

import type { CategoryOption } from "@/components/shared";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui";
import {
  CONDITION_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";
import { formatNaira } from "@/features/listings/lib/format";
import type { ListingFormInput } from "@/features/listings/schemas/listing.schemas";

interface ListingPreviewDialogProps {
  values: ListingFormInput | null;
  imagePreviewUrls: string[];
  categories: CategoryOption[];
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

function labelFor(options: { label: string; value: string }[], value?: string | null) {
  return options.find((o) => o.value === value)?.label ?? "—";
}

export function ListingPreviewDialog({
  values,
  imagePreviewUrls,
  categories,
  onClose,
  onConfirm,
  isSubmitting
}: ListingPreviewDialogProps) {
  const categoryName = categories.find((c) => c.id === values?.categoryId)?.name;
  const subcategoryName = categories.find((c) => c.id === values?.subcategoryId)?.name;

  return (
    <Dialog open={Boolean(values)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preview your listing</DialogTitle>
        </DialogHeader>

        {values ? (
          <div className="grid gap-4">
            {imagePreviewUrls.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto">
                {imagePreviewUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-black/5"
                  >
                    <Image
                      src={url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {index === 0 ? (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Cover
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                    values.isFree
                      ? "bg-[#1B1F3B]/10 text-[#1B1F3B]"
                      : "bg-[#E8543D]/10 text-[#E8543D]"
                  }`}
                >
                  {values.isFree ? "Free" : "For sale"}
                </span>
                {values.isNegotiable ? (
                  <span className="inline-block rounded-full bg-[#E8A33D]/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#E8A33D] uppercase">
                    Negotiable
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[#1B1F3B]">{values.title}</h3>
              <p className="text-lg font-bold text-[#1B1F3B]">
                {formatNaira(values.isFree ? null : Number(values.price))}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-black/50">Category</dt>
              <dd className="text-[#1B1F3B]">{subcategoryName ?? categoryName ?? "—"}</dd>

              <dt className="text-black/50">Condition</dt>
              <dd className="text-[#1B1F3B]">{labelFor(CONDITION_OPTIONS, values.condition)}</dd>

              <dt className="text-black/50">Suitable for</dt>
              <dd className="text-[#1B1F3B]">
                {labelFor(SUITABLE_FOR_OPTIONS, values.suitableFor)}
              </dd>

              <dt className="text-black/50">Quantity</dt>
              <dd className="text-[#1B1F3B]">{values.quantity}</dd>

              <dt className="text-black/50">Location</dt>
              <dd className="text-[#1B1F3B]">
                {[values.town, values.lga, values.state].filter(Boolean).join(", ")}
              </dd>

              <dt className="text-black/50">Delivery</dt>
              <dd className="text-[#1B1F3B]">
                {labelFor(DELIVERY_METHOD_OPTIONS, values.deliveryMethod)}
              </dd>
            </dl>

            <p className="text-sm whitespace-pre-line text-[#1B1F3B]/80">{values.description}</p>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Edit
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
          >
            {isSubmitting ? "Posting…" : "Confirm & post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
