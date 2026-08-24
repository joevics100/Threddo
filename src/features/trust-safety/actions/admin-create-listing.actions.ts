"use server";

import { redirect } from "next/navigation";

import { listingSchema, type ListingInput } from "@/features/listings/schemas/listing.schemas";
import { requireAdmin } from "@/features/trust-safety/actions/admin.actions";

export interface CreateListingForUserResult {
  error?: string;
}

/**
 * Creates a listing owned by someone OTHER than the person submitting the
 * form — for staff listing items on behalf of a seller who dropped off
 * photos (e.g. over WhatsApp) and doesn't want to deal with the app
 * themselves. The listing belongs to that user from the moment it's
 * created: it shows up in their dashboard and they can view/edit/delete it
 * exactly like anything they'd posted themselves — no separate "claiming"
 * step, no invite, no action required on their end.
 *
 * Requires the "Admins can create listings for any user" RLS policy
 * (0014_admin_create_listings.sql) — without it this insert is rejected the
 * same way it would be for anyone else trying to set another user's id.
 */
export async function createListingForUserAction(
  targetUserId: string,
  values: ListingInput
): Promise<CreateListingForUserResult> {
  const { supabase, userId: adminId, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = listingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the details and try again." };
  }

  // Confirm the target actually exists and isn't banned — otherwise this
  // would silently create an orphaned or unreachable listing.
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) {
    return { error: "Couldn't find that user." };
  }
  if (targetProfile.is_banned) {
    return { error: "This user is banned — can't create a listing for them." };
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
    // An admin creating the listing directly IS the review step — no
    // reason to route it back through the approval queue to themselves.
    status: "approved"
  });

  if (insertError) {
    return { error: "Couldn't save the listing. Please try again." };
  }

  // Land back on the form with the same user pre-selected — staff are
  // usually adding several items for the same person in one sitting.
  redirect(`/admin/listings/new?userId=${targetUserId}&created=1`);
}
