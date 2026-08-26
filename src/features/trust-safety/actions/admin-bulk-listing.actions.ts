"use server";

import { revalidatePath } from "next/cache";

import { listingSchema, type ListingInput } from "@/features/listings/schemas/listing.schemas";
import { requireAdmin } from "@/features/trust-safety/actions/admin.actions";

export interface BulkListingItemError {
  index: number;
  title: string;
  error: string;
}

export interface CreateListingsBulkForUserResult {
  successCount: number;
  errors: BulkListingItemError[];
}

/**
 * The bulk counterpart to createListingForUserAction — staff adding several
 * items at once for a seller who dropped off a pile of photos and doesn't
 * want to deal with the app themselves. Every listing belongs to that user
 * from creation, auto-approved (an admin creating it directly IS the review
 * step), same as the single-item admin-create flow.
 *
 * Items are inserted one at a time, same reasoning as the self-serve bulk
 * action: one bad item shouldn't sink the rest of the batch.
 */
export async function createListingsBulkForUserAction(
  targetUserId: string,
  items: ListingInput[]
): Promise<CreateListingsBulkForUserResult> {
  const { supabase, userId: adminId, error: authError } = await requireAdmin();
  if (authError) {
    return {
      successCount: 0,
      errors: items.map((item, index) => ({
        index,
        title: item.title || `Item ${index + 1}`,
        error: authError
      }))
    };
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) {
    return {
      successCount: 0,
      errors: items.map((item, index) => ({
        index,
        title: item.title || `Item ${index + 1}`,
        error: "Couldn't find that user."
      }))
    };
  }
  if (targetProfile.is_banned) {
    return {
      successCount: 0,
      errors: items.map((item, index) => ({
        index,
        title: item.title || `Item ${index + 1}`,
        error: "This user is banned — can't create listings for them."
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
      user_id: targetUserId,
      created_by_admin_id: adminId,
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
      status: "approved"
    });

    if (insertError) {
      errors.push({ index, title: data.title, error: "Couldn't save this listing." });
    } else {
      successCount++;
    }
  }

  if (successCount > 0) {
    revalidatePath("/admin/listings");
  }

  return { successCount, errors };
}
