"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ToggleSavedResult {
  error?: string;
  saved?: boolean;
}

export async function toggleSavedListingAction(listingId: string): Promise<ToggleSavedResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Log in to save listings." };
  }

  const { data: existing } = await supabase
    .from("saved_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("saved_listings").delete().eq("id", existing.id);
    if (error) return { error: "Couldn't remove this from your saved items." };
    revalidatePath("/saved");
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_listings")
    .insert({ user_id: user.id, listing_id: listingId });

  if (error) return { error: "Couldn't save this listing." };
  revalidatePath("/saved");
  return { saved: true };
}
