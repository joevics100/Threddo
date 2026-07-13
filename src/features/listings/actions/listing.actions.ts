"use server";

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
