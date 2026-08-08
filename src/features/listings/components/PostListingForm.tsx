"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";

import { ChevronLeft, ChevronRight, Loader2, Sparkles, Star, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { analyzeListingImageAction } from "@/features/listings/actions/ai-assist.actions";
import {
  createListingAction,
  updateListingAction
} from "@/features/listings/actions/listing.actions";
import { ListingPreviewDialog } from "@/features/listings/components/ListingPreviewDialog";
import {
  CONDITION_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  MATERIAL_OPTIONS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";
import { compressListingImage } from "@/features/listings/lib/compress-image";
import { uploadListingImages } from "@/features/listings/lib/upload-listing-images";
import {
  listingFormSchema,
  withSubcategoryRequirement,
  type ListingFormInput
} from "@/features/listings/schemas/listing.schemas";

interface PostListingFormProps {
  categories: CategoryOption[];
  defaultWhatsappNumber: string;
  /** "edit" pre-fills the form from an existing listing and saves in place instead of creating a new one. */
  mode?: "create" | "edit";
  listingId?: string;
  initialValues?: ListingFormInput;
  initialImageUrls?: string[];
}

/** One photo slot — either an already-uploaded URL or a freshly-picked file. */
type ImageItem =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; previewUrl: string };

const DRAFT_STORAGE_KEY = "threddo:draft-listing";

/** Reads a File as base64 (no data-URL prefix) for sending to the Gemini analysis action. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const DEFAULT_VALUES = (defaultWhatsappNumber: string): ListingFormInput => ({
  title: "",
  description: "",
  price: "",
  isFree: false,
  isNegotiable: false,
  quantity: 1,
  categoryId: "",
  subcategoryId: null,
  suitableFor: "" as unknown as ListingFormInput["suitableFor"],
  brand: "",
  condition: "" as unknown as ListingFormInput["condition"],
  size: "",
  color: "",
  material: null,
  state: "",
  lga: "",
  town: "",
  deliveryMethod: "" as unknown as ListingFormInput["deliveryMethod"],
  whatsappNumber: defaultWhatsappNumber,
  allowCalls: false,
  termsAccepted: false
});

export function PostListingForm({
  categories,
  defaultWhatsappNumber,
  mode = "create",
  listingId,
  initialValues,
  initialImageUrls
}: PostListingFormProps) {
  const isEdit = mode === "edit";

  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>(
    () => initialImageUrls?.map((url): ImageItem => ({ kind: "existing", url })) ?? []
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  // Raw, not-yet-compressed picks — shown immediately with a "compressing"
  // overlay so the user sees their photo right away instead of a blank gap
  // while compression runs in the background.
  const [pendingPreviews, setPendingPreviews] = useState<{ id: string; url: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewValues, setPreviewValues] = useState<ListingFormInput | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const hasProfileNumber = Boolean(defaultWhatsappNumber);
  const [useDifferentNumber, setUseDifferentNumber] = useState(isEdit ? true : !hasProfileNumber);

  // Subcategory is only required when the chosen top-level category actually
  // has subcategories (some, like "Other", don't) — figured out from the
  // live category tree rather than baked into the static schema.
  const categoryIdsRequiringSubcategory = useMemo(
    () => new Set(categories.filter((c) => c.parent_id).map((c) => c.parent_id as string)),
    [categories]
  );
  const formSchema = useMemo(
    () => withSubcategoryRequirement(listingFormSchema, categoryIdsRequiringSubcategory),
    [categoryIdsRequiringSubcategory]
  );

  const form = useForm<ListingFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES(defaultWhatsappNumber)
  });

  const isFree = form.watch("isFree");
  const imagePreviewUrls = images.map((item) =>
    item.kind === "existing" ? item.url : item.previewUrl
  );

  // Object URLs for freshly-picked photos — revoked whenever they drop out of state.
  useEffect(() => {
    const newFileUrls = images
      .filter((item): item is Extract<ImageItem, { kind: "new" }> => item.kind === "new")
      .map((item) => item.previewUrl);
    return () => newFileUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  // Belt-and-suspenders cleanup for the raw "compressing" previews in case
  // the component unmounts mid-compression.
  const pendingPreviewsRef = useRef(pendingPreviews);
  pendingPreviewsRef.current = pendingPreviews;
  useEffect(() => {
    return () => pendingPreviewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  // ── Draft (create mode only — saved locally in this browser; photos can't
  // be persisted this way, so only the text fields/selections are saved) ────
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) setDraftSavedAt((JSON.parse(raw) as { savedAt: string }).savedAt);
    } catch {
      // Corrupt or inaccessible storage — ignore, just don't offer a draft.
    }
  }, [isEdit]);

  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isEdit) return;
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
  }, [isEdit]);

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
  async function handleImagesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setImageError(null);

    const incoming = Array.from(fileList);

    if (images.length + incoming.length > MAX_LISTING_IMAGES) {
      setImageError(`You can add up to ${MAX_LISTING_IMAGES} photos.`);
      return;
    }

    const pending = incoming.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file)
    }));
    setPendingPreviews((prev) => [...prev, ...pending]);
    setIsCompressing(true);
    // Phone photos are routinely 3-8MB — compress before the size check
    // instead of rejecting them outright, so people don't have to go
    // find a photo editor just to post a listing.
    const compressed = await Promise.all(incoming.map(compressListingImage));
    setIsCompressing(false);
    pending.forEach((p) => URL.revokeObjectURL(p.url));
    setPendingPreviews((prev) => prev.filter((p) => !pending.some((done) => done.id === p.id)));

    const tooLarge = compressed.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      setImageError(`${tooLarge.name} is still too large even after compression.`);
      return;
    }

    setImages((prev) => [
      ...prev,
      ...compressed.map(
        (file): ImageItem => ({
          kind: "new",
          file,
          previewUrl: URL.createObjectURL(file)
        })
      )
    ]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function makeCoverPhoto(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  // ── AI photo analysis (create mode only, manually triggered) ───────────
  async function analyzeFirstPhoto(file: File) {
    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeListingImageAction(base64, file.type, categories);

      if (result.error || !result.suggestion) {
        toast.error(result.error ?? "AI parsing didn't work — please fill out the form.");
        return;
      }

      const s = result.suggestion;
      if (s.title) form.setValue("title", s.title, { shouldValidate: true });
      if (s.description) form.setValue("description", s.description, { shouldValidate: true });

      if (s.categorySlug) {
        const category = categories.find((c) => c.slug === s.categorySlug && !c.parent_id);
        if (category) {
          form.setValue("categoryId", category.id, { shouldValidate: true });
          const subcategory = s.subcategorySlug
            ? categories.find((c) => c.slug === s.subcategorySlug && c.parent_id === category.id)
            : undefined;
          form.setValue("subcategoryId", subcategory?.id ?? null);
        }
      }

      if (s.brand) form.setValue("brand", s.brand);
      if (s.color) form.setValue("color", s.color);
      if (s.material) form.setValue("material", s.material);
      form.setValue("condition", s.condition, { shouldValidate: true });
      form.setValue("suitableFor", s.suitableFor, { shouldValidate: true });

      toast.success(
        "Filled in details from your photo — have a look and edit anything that's off."
      );
    } catch {
      toast.error("AI parsing didn't work — please fill out the form.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ── Preview + submit ────────────────────────────────────────────────────
  // Top-to-bottom order the fields actually appear in the form, used to pick
  // the first one to scroll to when several are invalid at once.
  const FIELD_ORDER = [
    "images",
    "title",
    "price",
    "quantity",
    "description",
    "categoryId",
    "suitableFor",
    "condition",
    "state",
    "deliveryMethod",
    "whatsappNumber",
    "termsAccepted"
  ] as const;

  function scrollToField(key: string) {
    const el = document.querySelector<HTMLElement>(`[data-field="${key}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = el.querySelector<HTMLElement>(
      'input, select, textarea, button, [role="radio"], [tabindex]'
    );
    // Let the smooth scroll get underway before stealing focus, so the
    // browser doesn't jump straight there without the animation.
    window.setTimeout(() => focusable?.focus({ preventScroll: true }), 300);
  }

  function scrollToFirstError(errors: Partial<Record<string, unknown>>) {
    // categoryId's data-field also covers subcategoryId (they share one
    // section); state's data-field also covers lga.
    const normalized = { ...errors } as Record<string, unknown>;
    if (normalized.subcategoryId && !normalized.categoryId) normalized.categoryId = true;
    if (normalized.lga && !normalized.state) normalized.state = true;

    const firstKey = FIELD_ORDER.find((key) => normalized[key]);
    if (firstKey) scrollToField(firstKey);
  }

  function openPreview(values: ListingFormInput) {
    if (images.length === 0) {
      setImageError("Add at least one photo.");
      scrollToField("images");
      return;
    }
    setImageError(null);
    setPreviewValues(values);
  }

  async function confirmPost() {
    if (!previewValues) return;
    setFormError(null);

    const newFiles = images
      .filter((item): item is Extract<ImageItem, { kind: "new" }> => item.kind === "new")
      .map((item) => item.file);

    setIsUploading(true);
    let uploadedUrls: string[];
    try {
      uploadedUrls = newFiles.length > 0 ? await uploadListingImages(newFiles) : [];
    } catch (error) {
      setIsUploading(false);
      setImageError(error instanceof Error ? error.message : "Couldn't upload your photos.");
      return;
    }
    setIsUploading(false);
    clearDraftSilently();

    // Stitch existing URLs and newly-uploaded URLs back together in the
    // order the user arranged them in.
    let uploadedIndex = 0;
    const imageUrls = images.map((item) =>
      item.kind === "existing" ? item.url : uploadedUrls[uploadedIndex++]
    );

    startTransition(async () => {
      const result = isEdit
        ? await updateListingAction(listingId!, { ...previewValues, images: imageUrls })
        : await createListingAction(
            { ...previewValues, images: imageUrls },
            { syncNumberToProfile: !useDifferentNumber }
          );
      // Both actions redirect on success, so reaching here means it failed.
      if (result?.error) {
        setFormError(result.error);
        setPreviewValues(null);
      }
    });
  }

  const isSubmitting = isPending || isUploading || isCompressing;

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

      <form onSubmit={form.handleSubmit(openPreview, scrollToFirstError)} className="grid gap-8">
        {isAnalyzing ? (
          <div className="sticky top-2 z-10 flex items-center justify-center gap-2 rounded-full bg-[#1B1F3B] px-4 py-2 text-sm font-medium text-white shadow-md">
            <Sparkles className="size-4 animate-pulse text-[#E8A33D]" />
            <span className="animate-pulse">Filling form with AI…</span>
          </div>
        ) : null}

        {/* Photos */}
        <div className="grid gap-2" data-field="images">
          <label className="text-sm font-medium">
            Photos <span className="text-muted-foreground">(up to {MAX_LISTING_IMAGES})</span>
          </label>
          <p className="-mt-1 text-xs text-muted-foreground">
            Straight from your phone is fine — we&apos;ll compress large photos automatically.
          </p>

          <div
            className={`flex flex-wrap gap-3 rounded-lg ${
              imageError ? "outline-2 outline-offset-4 outline-destructive/60" : ""
            }`}
          >
            {images.map((item, index) => (
              <div
                key={item.kind === "existing" ? item.url : item.previewUrl}
                className="relative size-24 overflow-hidden rounded-lg border"
              >
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
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                    aria-label="Move photo later"
                    className="p-0.5 text-white disabled:opacity-30"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {pendingPreviews.map((preview) => (
              <div
                key={preview.id}
                className="relative size-24 overflow-hidden rounded-lg border"
              >
                <Image
                  src={preview.url}
                  alt="Compressing upload"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="animate-image-compress-sweep absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-[10px] font-medium">Compressing…</span>
                </div>
              </div>
            ))}

            {images.length < MAX_LISTING_IMAGES ? (
              <label
                className={`flex size-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground ${
                  isCompressing ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-accent"
                }`}
              >
                {isCompressing ? "Compressing…" : "+ Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isCompressing}
                  className="hidden"
                  onChange={(e) => {
                    void handleImagesSelected(e.target.files);
                    // Allow re-selecting the same file later (e.g. after removing it).
                    e.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
          {isCompressing ? (
            <p className="text-xs text-muted-foreground">
              Compressing your photo{pendingPreviews.length > 1 ? "s" : ""} — feel free to keep
              filling out the rest of the form, they&apos;ll finish in the background.
            </p>
          ) : null}
          {images.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              The first photo is your cover photo — tap the star on another photo to make it the
              cover, or use the arrows to reorder. &ldquo;Fill with AI&rdquo; below only looks at
              the cover photo, so arrange your photos first.
            </p>
          ) : null}
          {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
          {!isEdit && images[0]?.kind === "new" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAnalyzing}
              onClick={() => images[0]?.kind === "new" && void analyzeFirstPhoto(images[0].file)}
              className="w-fit gap-1.5 border-[#E8A33D]/40 text-[#1B1F3B] hover:bg-[#E8A33D]/10"
            >
              <Sparkles className="size-3.5 text-[#E8A33D]" />
              {isAnalyzing ? "Analyzing…" : "Fill with AI"}
            </Button>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem data-field="title">
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
              <FormItem data-field="price">
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
            <FormItem data-field="quantity">
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
            <FormItem data-field="description">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={6}
                  placeholder="Describe the item — fit, any flaws, why you're letting it go"
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-input/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-field="categoryId">
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
            categoryInvalid={!!form.formState.errors.categoryId}
            subcategoryInvalid={!!form.formState.errors.subcategoryId}
          />
          {form.formState.errors.categoryId ? (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
          {form.formState.errors.subcategoryId ? (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.subcategoryId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2" data-field="suitableFor">
          <label className="text-sm font-medium">Suitable for</label>
          <SegmentedControl
            options={SUITABLE_FOR_OPTIONS}
            value={form.watch("suitableFor")}
            onValueChange={(value) =>
              form.setValue("suitableFor", value as ListingFormInput["suitableFor"], {
                shouldValidate: true
              })
            }
            invalid={!!form.formState.errors.suitableFor}
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

        <div className="grid gap-2" data-field="condition">
          <label className="text-sm font-medium">Condition</label>
          <SegmentedControl
            options={CONDITION_OPTIONS}
            value={form.watch("condition")}
            onValueChange={(value) =>
              form.setValue("condition", value as ListingFormInput["condition"], {
                shouldValidate: true
              })
            }
            invalid={!!form.formState.errors.condition}
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

        <div className="grid gap-4" data-field="state">
          <LocationSelect
            state={form.watch("state") || null}
            lga={form.watch("lga") || null}
            onStateChange={(value) => form.setValue("state", value ?? "", { shouldValidate: true })}
            onLgaChange={(value) => form.setValue("lga", value ?? "", { shouldValidate: true })}
            stateInvalid={!!form.formState.errors.state}
            lgaInvalid={!!form.formState.errors.lga}
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

        <div className="grid gap-2" data-field="deliveryMethod">
          <label className="text-sm font-medium">Delivery method</label>
          <SegmentedControl
            options={DELIVERY_METHOD_OPTIONS}
            value={form.watch("deliveryMethod")}
            onValueChange={(value) =>
              form.setValue("deliveryMethod", value as ListingFormInput["deliveryMethod"], {
                shouldValidate: true
              })
            }
            invalid={!!form.formState.errors.deliveryMethod}
          />
          {form.formState.errors.deliveryMethod ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.deliveryMethod.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2" data-field="whatsappNumber">
          <FormLabel>WhatsApp number</FormLabel>

          {hasProfileNumber && !isEdit ? (
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

        {isEdit ? (
          <input type="hidden" {...form.register("termsAccepted")} value="true" />
        ) : (
          <>
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem
                  className="flex flex-row items-start gap-2 space-y-0"
                  data-field="termsAccepted"
                >
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
          </>
        )}

        {isEdit ? (
          <p className="-mt-6 text-xs text-muted-foreground">
            Saving will send this listing back for review before it&apos;s visible again.
          </p>
        ) : null}

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button type="submit" className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]">
          {isEdit ? "Preview changes" : "Preview listing"}
        </Button>
      </form>

      <ListingPreviewDialog
        values={previewValues}
        imagePreviewUrls={imagePreviewUrls}
        categories={categories}
        onClose={() => setPreviewValues(null)}
        onConfirm={confirmPost}
        isSubmitting={isSubmitting}
        confirmLabel={isEdit ? "Confirm & save" : "Confirm & post"}
        submittingLabel={isEdit ? "Saving…" : "Posting…"}
      />
    </Form>
  );
}
