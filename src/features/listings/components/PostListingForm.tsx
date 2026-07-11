"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

import { X } from "lucide-react";
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

export function PostListingForm({
  userId,
  categories,
  defaultWhatsappNumber
}: PostListingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasProfileNumber = Boolean(defaultWhatsappNumber);
  const [useDifferentNumber, setUseDifferentNumber] = useState(!hasProfileNumber);

  const form = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      isFree: false,
      categoryId: "",
      subcategoryId: null,
      suitableFor: undefined,
      brand: "",
      condition: undefined,
      size: "",
      color: "",
      material: null,
      state: "",
      lga: "",
      town: "",
      deliveryMethod: undefined,
      whatsappNumber: defaultWhatsappNumber,
      allowCalls: false
    }
  });

  // react-hook-form's watch() isn't memoizable by React Compiler — this is a
  // performance advisory, not a bug; safe to suppress.
  // eslint-disable-next-line react-hooks/incompatible-library
  const isFree = form.watch("isFree");

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

  async function onSubmit(values: ListingFormInput) {
    setFormError(null);
    setImageError(null);

    if (imageFiles.length === 0) {
      setImageError("Add at least one photo.");
      return;
    }

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

    startTransition(async () => {
      const result = await createListingAction(
        { ...values, images: imageUrls },
        { syncNumberToProfile: !useDifferentNumber }
      );
      // createListingAction redirects on success, so reaching here means it failed.
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  const isSubmitting = isPending || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
        {/* Photos */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Photos <span className="text-muted-foreground">(up to {MAX_LISTING_IMAGES})</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative size-24 overflow-hidden rounded-lg border">
                <Image
                  src={URL.createObjectURL(file)}
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
        </div>

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

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
        >
          {isUploading ? "Uploading photos…" : isPending ? "Posting…" : "Post listing"}
        </Button>
      </form>
    </Form>
  );
}
