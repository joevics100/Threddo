"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { listingSchema, type ListingInput } from "@/features/listings/schemas/listing.schemas";

export interface BulkListingItemError {
  index: number;
  title: string;
  error: string;
}

export interface CreateListingsBulkResult {
  successCount: number;
  errors: BulkListingItemError[];
}

/**
 * Creates several listings in one go, all owned by the current user — each
 * one goes through the exact same validation, and lands in the exact same
 * "pending" review queue, as if it had been posted individually. Items are
 * inserted one at a time (not a single bulk insert) specifically so one bad
 * item doesn't sink the rest of the batch — partial success is reported
 * back so the caller can show which items still need fixing.
 */
export async function createListingsBulkAction(
  items: ListingInput[]
): Promise<CreateListingsBulkResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      successCount: 0,
      errors: items.map((item, index) => ({
        index,
        title: item.title || `Item ${index + 1}`,
        error: "Your session has expired — please log in again."
      }))
    };
  }

  const errors: BulkListingItemError[] = [];
  let successCount = 0;

  for (const [index, item] of items.entries()) {
    const parsed = listingSchema.safeParse(item);
    if (!parsed.success) {
      errors.push({
        index,
        title: item.title || `Item ${index + 1}`,
        error: parsed.error.issues[0]?.message ?? "Please check this item's details."
      });
      continue;
    }

    const data = parsed.data;
    const { error: insertError } = await supabase.from("listings").insert({
      user_id: user.id,
      category_id: data.subcategoryId ?? data.categoryId,
      title: data.title,
      description: data.description,
      price: data.isFree ? null : Number(data.price),
      is_free: data.isFree,
      is_negotiable: !data.isFree && data.isNegotiable,
      condition: data.condition,
      size: data.size || null,
      quantity: data.quantity,
      suitable_for: data.suitableFor,
      brand: data.brand || null,
      color: data.color || null,
      material: data.material || null,
      state: data.state,
      lga: data.lga,
      town: data.town || null,
      delivery_method: data.deliveryMethod,
      images: data.images,
      allow_calls: data.allowCalls,
      whatsapp_number: data.whatsappNumber,
      status: "pending"
    });

    if (insertError) {
      errors.push({ index, title: data.title, error: "Couldn't save this listing." });
    } else {
      successCount++;
    }
  }

  if (successCount > 0) {
    // Remember the shared WhatsApp number on the profile, same as a single
    // post does — only worth doing once per batch, using whichever item
    // actually made it through.
    const firstSuccessfulNumber = items.find(
      (_, i) => !errors.some((e) => e.index === i)
    )?.whatsappNumber;
    if (firstSuccessfulNumber) {
      await supabase
        .from("profiles")
        .update({ whatsapp_number: firstSuccessfulNumber })
        .eq("id", user.id);
    }
    revalidatePath("/dashboard/listings");
  }

  return { successCount, errors };
}
