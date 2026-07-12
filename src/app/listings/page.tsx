import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { ListingCard } from "@/components/shared/ListingCard";
import { ListingFilters } from "@/features/listings/components/ListingFilters";

export const metadata: Metadata = {
  title: "Browse listings"
};

const PAGE_SIZE = 24;

interface ListingsPageProps {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    state?: string;
    lga?: string;
    freeOnly?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  const category = categories?.find((c) => c.slug === params.category);
  const subcategory = categories?.find((c) => c.slug === params.subcategory);

  let query = supabase
    .from("listings")
    .select("id, title, price, is_free, condition, state, lga, images", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (subcategory) {
    query = query.eq("category_id", subcategory.id);
  } else if (category) {
    const childIds = (categories ?? []).filter((c) => c.parent_id === category.id).map((c) => c.id);
    query = query.in("category_id", [category.id, ...childIds]);
  }

  if (params.state) query = query.eq("state", params.state);
  if (params.lga) query = query.eq("lga", params.lga);

  if (params.freeOnly === "1") {
    query = query.eq("is_free", true);
  } else {
    if (params.minPrice) query = query.gte("price", Number(params.minPrice));
    if (params.maxPrice) query = query.lte("price", Number(params.maxPrice));
  }

  const page = Math.max(1, Number(params.page) || 1);
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: listings, count } = await query;
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  let savedIds = new Set<string>();
  if (user && listings && listings.length > 0) {
    const { data: saved } = await supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .in(
        "listing_id",
        listings.map((l) => l.id)
      );
    savedIds = new Set((saved ?? []).map((s) => s.listing_id));
  }

  const pageLink = (targetPage: number) => {
    const next = new URLSearchParams({
      ...(params.category ? { category: params.category } : {}),
      ...(params.subcategory ? { subcategory: params.subcategory } : {}),
      ...(params.state ? { state: params.state } : {}),
      ...(params.lga ? { lga: params.lga } : {}),
      ...(params.freeOnly ? { freeOnly: params.freeOnly } : {}),
      ...(params.minPrice ? { minPrice: params.minPrice } : {}),
      ...(params.maxPrice ? { maxPrice: params.maxPrice } : {}),
      page: String(targetPage)
    });
    return `/listings?${next.toString()}`;
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Browse listings
      </h1>
      <p className="mt-1 text-black/60">
        {count ?? 0} item{count === 1 ? "" : "s"} available right now.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <ListingFilters categories={categories ?? []} />

        <div>
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  isFree={listing.is_free}
                  condition={listing.condition}
                  state={listing.state}
                  lga={listing.lga}
                  imageUrl={listing.images?.[0]}
                  isSaved={user ? savedIds.has(listing.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="text-black/60">No listings match these filters yet.</p>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={pageLink(page - 1)}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="px-4 py-2 text-sm text-black/60">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageLink(page + 1)}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
                >
                  Next →
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
