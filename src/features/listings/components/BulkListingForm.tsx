"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2, Plus, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CategoryOption } from "@/components/shared";
import { LocationSelect } from "@/components/shared";
import { Button, SegmentedControl } from "@/ui";
import { analyzeListingImageAction } from "@/features/listings/actions/ai-assist.actions";
import { createListingsBulkAction } from "@/features/listings/actions/bulk-listing.actions";
import { BulkItemCard } from "@/features/listings/components/BulkItemCard";
import { DELIVERY_METHOD_OPTIONS } from "@/features/listings/constants/listing-options";
import { compressListingImage, HeicConversionError } from "@/features/listings/lib/compress-image";
import { fileToBase64 } from "@/features/listings/lib/file-to-base64";
import {
  bulkItemFieldsSchema,
  bulkSharedSchema,
  type BulkItemInput,
  type BulkSharedInput
} from "@/features/listings/schemas/bulk-listing.schemas";
import {
  withSubcategoryRequirement,
  type ListingInput
} from "@/features/listings/schemas/listing.schemas";

export type BulkFormValues = {
  shared: BulkSharedInput;
  items: BulkItemInput[];
};

interface ItemMeta {
  clientId: string;
  file: File;
  previewUrl: string;
}

const MAX_BULK_ITEMS = 10;

const EMPTY_ITEM: BulkItemInput = {
  title: "",
  description: "",
  price: "",
  isFree: false,
  isNegotiable: false,
  quantity: 1,
  categoryId: "",
  subcategoryId: null,
  suitableFor: "unisex",
  brand: "",
  condition: "gently_used",
  size: "",
  color: "",
  material: ""
};

interface BulkListingFormProps {
  categories: CategoryOption[];
  defaultWhatsappNumber: string;
}

export function BulkListingForm({ categories, defaultWhatsappNumber }: BulkListingFormProps) {
  const router = useRouter();
  const [itemMeta, setItemMeta] = useState<ItemMeta[]>([]);
  const [analyzingIndices, setAnalyzingIndices] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryIdsRequiringSubcategory = new Set(
    categories.filter((c) => c.parent_id).map((c) => c.parent_id as string)
  );
  const formSchema = z.object({
    shared: bulkSharedSchema,
    items: z
      .array(withSubcategoryRequirement(bulkItemFieldsSchema, categoryIdsRequiringSubcategory))
      .min(1, "Add at least one photo to get started")
  });

  const form = useForm<BulkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shared: {
        state: "",
        lga: "",
        town: "",
        deliveryMethod: "meet_up",
        whatsappNumber: defaultWhatsappNumber,
        allowCalls: false,
        termsAccepted: false
      },
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  async function analyzeItem(index: number, file: File) {
    setAnalyzingIndices((prev) => new Set(prev).add(index));
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeListingImageAction(base64, file.type, categories);
      if (result.error || !result.suggestion) return;

      const s = result.suggestion;
      const path = `items.${index}` as const;
      if (s.title) form.setValue(`${path}.title`, s.title);
      if (s.description) form.setValue(`${path}.description`, s.description);
      if (s.categorySlug) {
        const category = categories.find((c) => c.slug === s.categorySlug && !c.parent_id);
        if (category) {
          form.setValue(`${path}.categoryId`, category.id);
          const subcategory = s.subcategorySlug
            ? categories.find((c) => c.slug === s.subcategorySlug && c.parent_id === category.id)
            : undefined;
          form.setValue(`${path}.subcategoryId`, subcategory?.id ?? null);
        }
      }
      if (s.brand) form.setValue(`${path}.brand`, s.brand);
      if (s.color) form.setValue(`${path}.color`, s.color);
      if (s.material) form.setValue(`${path}.material`, s.material);
      form.setValue(`${path}.condition`, s.condition);
      form.setValue(`${path}.suitableFor`, s.suitableFor);
    } finally {
      setAnalyzingIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const room = MAX_BULK_ITEMS - itemMeta.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_BULK_ITEMS} items at once.`);
      return;
    }
    const toProcess = incoming.slice(0, room);
    if (incoming.length > toProcess.length) {
      toast(`Only added the first ${room} — ${MAX_BULK_ITEMS} items max per batch.`);
    }

    let nextIndex = itemMeta.length;
    for (const file of toProcess) {
      let compressed: File;
      try {
        compressed = await compressListingImage(file);
      } catch (err) {
        if (err instanceof HeicConversionError) {
          toast.error(`Couldn't process ${err.fileName} — skipped it.`);
        }
        continue;
      }

      const index = nextIndex++;
      const previewUrl = URL.createObjectURL(compressed);
      setItemMeta((prev) => [
        ...prev,
        { clientId: `${Date.now()}-${index}`, file: compressed, previewUrl }
      ]);
      append({ ...EMPTY_ITEM });
      void analyzeItem(index, compressed);
    }
  }

  function removeItem(index: number) {
    remove(index);
    setItemMeta((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  async function onSubmit(values: BulkFormValues) {
    if (itemMeta.length === 0) {
      toast.error("Add at least one photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { uploadListingImages } = await import("@/features/listings/lib/upload-listing-images");

      const uploadResults = await Promise.allSettled(
        itemMeta.map((meta) => uploadListingImages([meta.file]))
      );

      const prepared = uploadResults.map((result, index) => {
        if (result.status === "fulfilled") {
          const listingInput: ListingInput = {
            ...values.shared,
            ...values.items[index],
            images: result.value
          };
          return { originalIndex: index, listingInput };
        }
        return { originalIndex: index, uploadError: "Couldn't upload this photo." };
      });

      const validItems = prepared.filter(
        (p): p is { originalIndex: number; listingInput: ListingInput } => !!p.listingInput
      );

      const bulkResult =
        validItems.length > 0
          ? await createListingsBulkAction(validItems.map((v) => v.listingInput))
          : { successCount: 0, errors: [] };

      const failedOriginalIndices = new Set<number>();
      prepared.forEach((p) => {
        if (p.uploadError) failedOriginalIndices.add(p.originalIndex);
      });
      bulkResult.errors.forEach((e) => {
        failedOriginalIndices.add(validItems[e.index].originalIndex);
      });

      const succeededCount = itemMeta.length - failedOriginalIndices.size;

      if (failedOriginalIndices.size === 0) {
        toast.success(`Posted ${succeededCount} listing${succeededCount === 1 ? "" : "s"}!`);
        router.push("/dashboard/listings");
        return;
      }

      // Partial (or total) failure — drop the ones that succeeded and leave
      // the rest in place so they're easy to fix and resubmit, instead of
      // making the person redo the whole batch from scratch.
      if (succeededCount > 0) {
        toast.success(`Posted ${succeededCount} — ${failedOriginalIndices.size} need fixing.`);
      } else {
        toast.error("Couldn't post these listings — see what needs fixing below.");
      }

      Array.from({ length: itemMeta.length }, (_, i) => i)
        .filter((i) => !failedOriginalIndices.has(i))
        .sort((a, b) => b - a) // remove highest index first so earlier indices stay valid
        .forEach((i) => removeItem(i));
    } catch {
      toast.error("Something went wrong uploading your photos. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
      <section className="grid gap-4 rounded-xl border border-[#1B1F3B]/10 bg-white p-4">
        <h3 className="text-sm font-semibold text-[#1B1F3B]">
          Where you are &amp; how buyers reach you
        </h3>
        <p className="-mt-2 text-xs text-black/50">
          Entered once and applied to every item in this batch.
        </p>

        <LocationSelect
          state={form.watch("shared.state") || null}
          lga={form.watch("shared.lga") || null}
          onStateChange={(v) => form.setValue("shared.state", v ?? "", { shouldValidate: true })}
          onLgaChange={(v) => form.setValue("shared.lga", v ?? "", { shouldValidate: true })}
          stateInvalid={!!form.formState.errors.shared?.state}
          lgaInvalid={!!form.formState.errors.shared?.lga}
        />

        <div className="grid gap-1.5">
          <label className="text-sm font-medium">
            Town/community <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            value={form.watch("shared.town") ?? ""}
            onChange={(e) => form.setValue("shared.town", e.target.value)}
            placeholder="e.g. Sabo, Yaba"
            className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D]"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Delivery method</label>
          <SegmentedControl
            options={DELIVERY_METHOD_OPTIONS}
            value={form.watch("shared.deliveryMethod")}
            onValueChange={(v) =>
              form.setValue("shared.deliveryMethod", v as BulkSharedInput["deliveryMethod"], {
                shouldValidate: true
              })
            }
            invalid={!!form.formState.errors.shared?.deliveryMethod}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium">WhatsApp number</label>
          <input
            value={form.watch("shared.whatsappNumber") ?? ""}
            onChange={(e) => form.setValue("shared.whatsappNumber", e.target.value)}
            aria-invalid={!!form.formState.errors.shared?.whatsappNumber || undefined}
            className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D] aria-invalid:border-destructive"
          />
          {form.formState.errors.shared?.whatsappNumber ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.shared.whatsappNumber.message}
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.watch("shared.allowCalls")}
            onChange={(e) => form.setValue("shared.allowCalls", e.target.checked)}
            className="size-4 rounded border-input"
          />
          Also allow phone calls (not just WhatsApp)
        </label>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1B1F3B]">
            Items ({fields.length}/{MAX_BULK_ITEMS})
          </h3>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#1B1F3B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B1F3B]/90">
            <Plus className="size-3.5" />
            Add photos
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {fields.length === 0 ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#1B1F3B]/15 py-12 text-center text-sm text-black/50 hover:border-[#E8A33D]/50">
            <Sparkles className="size-6 text-[#E8A33D]" />
            Add a few photos — one item per photo — and AI will suggest details for each.
            <input
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <div className="grid gap-3">
            {fields.map((field, index) => (
              <BulkItemCard
                key={field.id}
                index={index}
                form={form}
                categories={categories}
                previewUrl={itemMeta[index]?.previewUrl ?? ""}
                isAnalyzing={analyzingIndices.has(index)}
                onRemove={() => removeItem(index)}
                onReanalyze={() => {
                  const meta = itemMeta[index];
                  if (meta) void analyzeItem(index, meta.file);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {fields.length > 0 ? (
        <>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.watch("shared.termsAccepted")}
              onChange={(e) =>
                form.setValue("shared.termsAccepted", e.target.checked, { shouldValidate: true })
              }
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>
              I agree to Threddo&apos;s Terms of Service and confirm these listings follow the
              community guidelines.
            </span>
          </label>
          {form.formState.errors.shared?.termsAccepted ? (
            <p className="-mt-6 text-sm text-destructive">
              {form.formState.errors.shared.termsAccepted.message}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Posting {fields.length} listing{fields.length === 1 ? "" : "s"}…
              </>
            ) : (
              `Post ${fields.length} listing${fields.length === 1 ? "" : "s"}`
            )}
          </Button>
        </>
      ) : null}
    </form>
  );
}
