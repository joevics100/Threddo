import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { generateListingSections } from "@/lib/listing-sections";

/**
 * Generates the collapsible buyer-guide sections for one listing and saves
 * them. Never throws — a missing AI key or a model hiccup just means the
 * listing page shows no accordion until the next run. Pass `force` to
 * overwrite existing sections (e.g. after the seller edited the listing).
 */
export async function generateAndSaveListingSections(
  supabase: SupabaseClient,
  listingId: string,
  options?: { force?: boolean }
): Promise<boolean> {
  try {
    const { data: listing } = await supabase
      .from("listings")
      .select(
        "id, title, description, brand, color, material, condition, suitable_for, size, is_free, is_negotiable, state, lga, detail_sections, category:categories!listings_category_id_fkey(name)"
      )
      .eq("id", listingId)
      .single();

    if (!listing) return false;
    if (
      !options?.force &&
      Array.isArray(listing.detail_sections) &&
      listing.detail_sections.length
    ) {
      return true;
    }

    const category = listing.category as { name: string } | { name: string }[] | null;
    const categoryName = Array.isArray(category)
      ? (category[0]?.name ?? null)
      : (category?.name ?? null);

    const sections = await generateListingSections({
      title: listing.title,
      description: listing.description,
      categoryName,
      brand: listing.brand,
      color: listing.color,
      material: listing.material,
      condition: listing.condition,
      suitableFor: listing.suitable_for,
      size: listing.size,
      isFree: listing.is_free,
      isNegotiable: listing.is_negotiable,
      state: listing.state,
      lga: listing.lga
    });

    const { error } = await supabase
      .from("listings")
      .update({ detail_sections: sections })
      .eq("id", listingId);

    return !error;
  } catch (error) {
    console.error("Listing sections generation failed:", error);
    return false;
  }
}
