"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { listingSchema, type ListingInput } from "@/features/listings/schemas/listing.schemas";

export interface CreateListingResult {
  error?: string;
}

export async function createListingAction(
  values: ListingInput,
  options?: { syncNumberToProfile?: boolean }
): Promise<CreateListingResult> {
  const parsed = listingSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
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
    return { error: "Couldn't save your listing. Please try again." };
  }

  // Remember this number on the profile so it prefills next time — unless the
  // seller explicitly used a one-off different number for this listing.
  if (options?.syncNumberToProfile !== false) {
    await supabase
      .from("profiles")
      .update({ whatsapp_number: data.whatsappNumber })
      .eq("id", user.id);
  }

  redirect("/post/success");
}

export interface UpdateListingResult {
  error?: string;
}

/**
 * Edits an existing listing owned by the current user. Edited listings go
 * back to "pending" so they're re-reviewed — same trust/safety bar as a new
 * post, and it stops someone from swapping details after approval.
 */
export async function updateListingAction(
  listingId: string,
  values: ListingInput
): Promise<UpdateListingResult> {
  const parsed = listingSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  const data = parsed.data;

  const { error: updateError } = await supabase
    .from("listings")
    .update({
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
      status: "pending",
      rejection_reason: null
    })
    // RLS also enforces this, but scoping the query to the owner keeps the
    // error message meaningful instead of a silent no-op update.
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/dashboard/listings");
  revalidatePath(`/listings/${listingId}`);
  redirect("/dashboard/listings?updated=1");
}

export interface DeleteListingResult {
  error?: string;
}

/** Deletes a listing (and its photos) owned by the current user. */
export async function deleteListingAction(listingId: string): Promise<DeleteListingResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, images")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== user.id) {
    return { error: "Listing not found." };
  }

  const { error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: "Couldn't delete this listing. Please try again." };
  }

  // Best-effort photo cleanup — don't fail the whole action over storage.
  const paths = (listing.images ?? [])
    .map((url: string) => {
      const marker = "/listings/";
      const index = url.indexOf(marker);
      return index === -1 ? null : url.slice(index + marker.length);
    })
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from("listings").remove(paths);
  }

  revalidatePath("/dashboard/listings");
  return {};
}
