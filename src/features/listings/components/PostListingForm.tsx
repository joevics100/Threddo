"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";

import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CategorySelect, LocationSelect, type CategoryOption } from "@/components/shared";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  NairaInput,
  SegmentedControl
} from "@/ui";
import { createListingAction } from "@/features/listings/actions/listing.actions";
import { ListingPreviewDialog } from "@/features/listings/components/ListingPreviewDialog";
import {
  CONDITION_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  MATERIAL_OPTIONS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";
import { uploadListingImages } from "@/features/listings/lib/upload-listing-images";
import {
  listingFormSchema,
  type ListingFormInput
} from "@/features/listings/schemas/listing.schemas";

interface PostListingFormProps {
  userId: string;
  categories: CategoryOption[];
  defaultWhatsappNumber: string;
}

const DRAFT_STORAGE_KEY = "threddo:draft-listing";

const DEFAULT_VALUES = (defaultWhatsappNumber: string): ListingFormInput => ({
  title: "",
  description: "",
  price: "",
  isFree: false,
  isNegotiable: false,
  quantity: 1,
  categoryId: "",
  subcategoryId: null,
  suitableFor: undefined as unknown as ListingFormInput["suitableFor"],
  brand: "",
  condition: undefined as unknown as ListingFormInput["condition"],
  size: "",
  color: "",
  material: null,
  state: "",
  lga: "",
  town: "",
  deliveryMethod: undefined as unknown as ListingFormInput["deliveryMethod"],
  whatsappNumber: defaultWhatsappNumber,
  allowCalls: false,
  termsAccepted: false
});

export function PostListingForm({
  userId,
  categories,
  defaultWhatsappNumber
}: PostListingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewValues, setPreviewValues] = useState<ListingFormInput | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const hasProfileNumber = Boolean(defaultWhatsappNumber);
  const [useDifferentNumber, setUseDifferentNumber] = useState(!hasProfileNumber);

  const form = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: DEFAULT_VALUES(defaultWhatsappNumber)
  });

  const isFree = form.watch("isFree");

  // Object URLs for photo previews — revoked whenever the file list changes.
  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  // ── Draft (saved locally in this browser — photos can't be persisted this
  // way, so only the text fields/selections are saved) ──────────────────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) setDraftSavedAt((JSON.parse(raw) as { savedAt: string }).savedAt);
    } catch {
      // Corrupt or inaccessible storage — ignore, just don't offer a draft.
    }
  }, []);

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({ savedAt: new Date().toISOString(), values })
          );
        } catch {
          // Storage full/unavailable — silently skip autosave.
        }
      }, 1000);
    });
    return () => {
      subscription.unsubscribe();
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restoreDraft() {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { values: ListingFormInput };
      form.reset(parsed.values);
    } catch {
      // Ignore — worst case the draft banner just disappears without effect.
    }
    setDraftSavedAt(null);
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Nothing to do if storage isn't accessible.
    }
    setDraftSavedAt(null);
  }

  function clearDraftSilently() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Not critical — the draft will just get overwritten next time.
    }
  }

  // ── Photos ──────────────────────────────────────────────────────────────
  function handleImagesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setImageError(null);

    const incoming = Array.from(fileList);
    const combined = [...imageFiles, ...incoming];

    if (combined.length > MAX_LISTING_IMAGES) {
      setImageError(`You can add up to ${MAX_LISTING_IMAGES} photos.`);
      return;
    }

    const tooLarge = incoming.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      setImageError(`${tooLarge.name} is over 5MB. Choose a smaller photo.`);
      return;
    }

    setImageFiles(combined);
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImageFiles((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function makeCoverPhoto(index: number) {
    if (index === 0) return;
    setImageFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  // ── Preview + submit ────────────────────────────────────────────────────
  function openPreview(values: ListingFormInput) {
    if (imageFiles.length === 0) {
      setImageError("Add at least one photo.");
      return;
    }
    setImageError(null);
    setPreviewValues(values);
  }

  async function confirmPost() {
    if (!previewValues) return;
    setFormError(null);

    setIsUploading(true);
    let imageUrls: string[];
    try {
      imageUrls = await uploadListingImages(imageFiles, userId);
    } catch (error) {
      setIsUploading(false);
      setImageError(error instanceof Error ? error.message : "Couldn't upload your photos.");
      return;
    }
    setIsUploading(false);
    clearDraftSilently();

    startTransition(async () => {
      const result = await createListingAction(
        { ...previewValues, images: imageUrls },
        { syncNumberToProfile: !useDifferentNumber }
      );
      // createListingAction redirects on success, so reaching here means it failed.
      if (result?.error) {
        setFormError(result.error);
        setPreviewValues(null);
      }
    });
  }

  const isSubmitting = isPending || isUploading;

  return (
    <Form {...form}>
      {draftSavedAt ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-4 py-3 text-sm">
          <span className="text-[#1B1F3B]">
            You have a saved draft from {new Date(draftSavedAt).toLocaleString()}. Photos
            aren&apos;t saved in drafts — you&apos;ll need to re-add them.
          </span>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={restoreDraft}>
              Restore
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={discardDraft}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}

      <form onSubmit={form.handleSubmit(openPreview)} className="grid gap-8">
        {/* Photos */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Photos <span className="text-muted-foreground">(up to {MAX_LISTING_IMAGES})</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative size-24 overflow-hidden rounded-lg border">
                <Image
                  src={imagePreviewUrls[index] ?? ""}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>

                {index === 0 ? (
                  <span className="absolute top-1 left-1 rounded bg-[#1B1F3B]/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCoverPhoto(index)}
                    aria-label="Set as cover photo"
                    className="absolute top-1 left-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}

                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    aria-label="Move photo earlier"
                    className="p-0.5 text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === imageFiles.length - 1}
                    onClick={() => moveImage(index, 1)}
                    aria-label="Move photo later"
                    className="p-0.5 text-white disabled:opacity-30"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {imageFiles.length < MAX_LISTING_IMAGES ? (
              <label className="flex size-24 cursor-pointer items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-accent">
                + Add photo
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImagesSelected(e.target.files)}
                />
              </label>
            ) : null}
          </div>
          {imageFiles.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              The first photo is your cover photo — tap the star on another photo to make it the
              cover, or use the arrows to reorder.
            </p>
          ) : null}
          {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Blue Ankara Gown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (naira)</FormLabel>
                <FormControl>
                  <NairaInput
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isFree}
                    placeholder="0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <FormLabel className="font-normal">I want to donate this item</FormLabel>
              </FormItem>
            )}
          />

          {!isFree ? (
            <FormField
              control={form.control}
              name="isNegotiable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Price is negotiable</FormLabel>
                </FormItem>
              )}
            />
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Quantity available <span className="text-muted-foreground">(if more than one)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={field.value}
                  onChange={(e) => field.onChange(Math.max(1, Number(e.target.value) || 1))}
                  className="w-28"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Describe the item — fit, any flaws, why you're letting it go"
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <CategorySelect
            categories={categories}
            categoryId={form.watch("categoryId") || null}
            subcategoryId={form.watch("subcategoryId")}
            onCategoryChange={(value) =>
              form.setValue("categoryId", value ?? "", { shouldValidate: true })
            }
            onSubcategoryChange={(value) =>
              form.setValue("subcategoryId", value, { shouldValidate: true })
            }
          />
          {form.formState.errors.categoryId ? (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Suitable for</label>
          <SegmentedControl
            options={SUITABLE_FOR_OPTIONS}
            value={form.watch("suitableFor")}
            onValueChange={(value) =>
              form.setValue("suitableFor", value as ListingFormInput["suitableFor"], {
                shouldValidate: true
              })
            }
          />
          {form.formState.errors.suitableFor ? (
            <p className="text-sm text-destructive">{form.formState.errors.suitableFor.message}</p>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Brand <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Zara" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2">
          <label className="text-sm font-medium">Condition</label>
          <SegmentedControl
            options={CONDITION_OPTIONS}
            value={form.watch("condition")}
            onValueChange={(value) =>
              form.setValue("condition", value as ListingFormInput["condition"], {
                shouldValidate: true
              })
            }
          />
          {form.formState.errors.condition ? (
            <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Size <span className="text-muted-foreground">(if applicable)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. UK 10, 42, L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Color <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Navy blue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Material <span className="text-muted-foreground">(optional)</span>
          </label>
          <SegmentedControl
            options={MATERIAL_OPTIONS}
            value={form.watch("material") ?? undefined}
            onValueChange={(value) => form.setValue("material", value)}
          />
        </div>

        <div className="grid gap-4">
          <LocationSelect
            state={form.watch("state") || null}
            lga={form.watch("lga") || null}
            onStateChange={(value) => form.setValue("state", value ?? "", { shouldValidate: true })}
            onLgaChange={(value) => form.setValue("lga", value ?? "", { shouldValidate: true })}
          />
          {form.formState.errors.state || form.formState.errors.lga ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.state?.message ?? form.formState.errors.lga?.message}
            </p>
          ) : null}

          <FormField
            control={form.control}
            name="town"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Town/community <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sabo, Yaba" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Delivery method</label>
          <SegmentedControl
            options={DELIVERY_METHOD_OPTIONS}
            value={form.watch("deliveryMethod")}
            onValueChange={(value) =>
              form.setValue("deliveryMethod", value as ListingFormInput["deliveryMethod"], {
                shouldValidate: true
              })
            }
          />
          {form.formState.errors.deliveryMethod ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.deliveryMethod.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <FormLabel>WhatsApp number</FormLabel>

          {hasProfileNumber ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id="useProfileNumber"
                checked={!useDifferentNumber}
                onCheckedChange={(checked) => {
                  const useProfile = checked === true;
                  setUseDifferentNumber(!useProfile);
                  form.setValue("whatsappNumber", useProfile ? defaultWhatsappNumber : "", {
                    shouldValidate: true
                  });
                }}
              />
              <label htmlFor="useProfileNumber" className="text-sm font-medium text-[#1B1F3B]">
                {defaultWhatsappNumber}
              </label>
            </div>
          ) : null}

          {!hasProfileNumber || useDifferentNumber ? (
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="e.g. 080XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="allowCalls"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="font-normal">Also call me on this number</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="font-normal">
                I agree to Threddo&apos;s{" "}
                <a href="/terms" target="_blank" className="underline">
                  Terms of Service
                </a>{" "}
                and confirm this listing follows the{" "}
                <a href="/safety" target="_blank" className="underline">
                  community guidelines
                </a>
                .
              </FormLabel>
            </FormItem>
          )}
        />
        {form.formState.errors.termsAccepted ? (
          <p className="-mt-6 text-sm text-destructive">
            {form.formState.errors.termsAccepted.message}
          </p>
        ) : null}

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]">
          Preview listing
        </Button>
      </form>

      <ListingPreviewDialog
        values={previewValues}
        imagePreviewUrls={imagePreviewUrls}
        categories={categories}
        onClose={() => setPreviewValues(null)}
        onConfirm={confirmPost}
        isSubmitting={isSubmitting}
      />
    </Form>
  );
}
