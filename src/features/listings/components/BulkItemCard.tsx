"use client";

import Image from "next/image";

import { Loader2, Sparkles, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { CategorySelect, type CategoryOption } from "@/components/shared";
import { NairaInput, SegmentedControl } from "@/ui";
import type { BulkFormValues } from "@/features/listings/components/BulkListingForm";
import {
  CONDITION_OPTIONS,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";

interface BulkItemCardProps {
  index: number;
  form: UseFormReturn<BulkFormValues>;
  categories: CategoryOption[];
  previewUrl: string;
  isAnalyzing: boolean;
  onRemove: () => void;
  onReanalyze: () => void;
}

/**
 * One item's editable fields in the bulk review list. Follows the same
 * convention PostListingForm uses for its own category/segmented-control
 * fields — form.watch()/form.setValue() directly, rather than
 * register()/Controller — since these aren't plain native inputs.
 */
export function BulkItemCard({
  index,
  form,
  categories,
  previewUrl,
  isAnalyzing,
  onRemove,
  onReanalyze
}: BulkItemCardProps) {
  const values = form.watch(`items.${index}`);
  const itemErrors = form.formState.errors.items?.[index];
  const hasAnyError = itemErrors && Object.keys(itemErrors).length > 0;

  function setField<K extends keyof BulkFormValues["items"][number]>(
    field: K,
    value: BulkFormValues["items"][number][K]
  ) {
    // react-hook-form can't fully resolve a dynamic `items.${number}.${K}`
    // path generically — this is the standard, narrow escape hatch for that
    // (the actual runtime behavior is exactly what it looks like: set the
    // field at this path to this value).
    form.setValue(`items.${index}.${field}` as never, value as never, { shouldValidate: true });
  }

  return (
    <div
      data-bulk-item={index}
      className={`grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-[96px_1fr] ${
        hasAnyError ? "border-destructive/50" : "border-[#1B1F3B]/10"
      }`}
    >
      <div className="relative">
        <div className="relative size-24 overflow-hidden rounded-lg border border-[#1B1F3B]/10">
          <Image src={previewUrl} alt="" fill className="object-cover" />
          {isAnalyzing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-5 animate-spin text-white" />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this item"
          className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#1B1F3B] text-white shadow-sm hover:bg-[#1B1F3B]/80"
        >
          <X className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="mt-2 flex w-24 items-center justify-center gap-1 rounded-full border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-2 py-1 text-[11px] font-medium text-[#8a5a1a] hover:bg-[#E8A33D]/20 disabled:opacity-50"
        >
          <Sparkles className="size-3" />
          Retry AI
        </button>
      </div>

      <div className="grid gap-3">
        <span className="text-xs font-semibold tracking-wide text-[#1B1F3B]/40 uppercase">
          Item {index + 1}
        </span>

        <div className="grid gap-1">
          <input
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Item name"
            aria-invalid={!!itemErrors?.title || undefined}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D] aria-invalid:border-destructive"
          />
          {itemErrors?.title ? (
            <p className="text-xs text-destructive">{itemErrors.title.message}</p>
          ) : null}
        </div>

        <CategorySelect
          categories={categories}
          categoryId={values.categoryId || null}
          subcategoryId={values.subcategoryId}
          onCategoryChange={(value) => {
            setField("categoryId", value ?? "");
            setField("subcategoryId", null);
          }}
          onSubcategoryChange={(value) => setField("subcategoryId", value)}
          categoryInvalid={!!itemErrors?.categoryId}
          subcategoryInvalid={!!itemErrors?.subcategoryId}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1">
            <span className="text-xs font-medium text-[#1B1F3B]/70">Suitable for</span>
            <SegmentedControl
              options={SUITABLE_FOR_OPTIONS}
              value={values.suitableFor}
              onValueChange={(value) =>
                setField("suitableFor", value as BulkFormValues["items"][number]["suitableFor"])
              }
              invalid={!!itemErrors?.suitableFor}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium text-[#1B1F3B]/70">Condition</span>
            <SegmentedControl
              options={CONDITION_OPTIONS}
              value={values.condition}
              onValueChange={(value) =>
                setField("condition", value as BulkFormValues["items"][number]["condition"])
              }
              invalid={!!itemErrors?.condition}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="col-span-2 flex items-center gap-2 text-xs sm:col-span-4">
            <input
              type="checkbox"
              checked={values.isFree}
              onChange={(e) => setField("isFree", e.target.checked)}
              className="size-4 rounded border-input"
            />
            Donating this item (free)
          </label>
          {!values.isFree ? (
            <div className="col-span-2 grid gap-1 sm:col-span-4">
              <NairaInput
                value={values.price ?? ""}
                onValueChange={(v) => setField("price", v)}
                aria-invalid={!!itemErrors?.price || undefined}
              />
              {itemErrors?.price ? (
                <p className="text-xs text-destructive">{itemErrors.price.message}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            value={values.brand ?? ""}
            onChange={(e) => setField("brand", e.target.value)}
            placeholder="Brand (optional)"
            className="rounded-lg border border-input px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#E8A33D]"
          />
          <input
            value={values.color ?? ""}
            onChange={(e) => setField("color", e.target.value)}
            placeholder="Color (optional)"
            className="rounded-lg border border-input px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#E8A33D]"
          />
          <input
            value={values.size ?? ""}
            onChange={(e) => setField("size", e.target.value)}
            placeholder="Size (optional)"
            className="rounded-lg border border-input px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#E8A33D]"
          />
          <input
            value={values.quantity ?? 1}
            type="number"
            min={1}
            onChange={(e) => setField("quantity", Number(e.target.value))}
            placeholder="Qty"
            className="rounded-lg border border-input px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#E8A33D]"
          />
        </div>

        <div className="grid gap-1">
          <textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={2}
            placeholder="Short description"
            aria-invalid={!!itemErrors?.description || undefined}
            className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D] aria-invalid:border-destructive"
          />
          {itemErrors?.description ? (
            <p className="text-xs text-destructive">{itemErrors.description.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
