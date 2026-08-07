import type { Metadata } from "next";
import Link from "next/link";

import type { SuitableFor } from "@/types/database.types";

import { createClient } from "@/lib/supabase/server";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListingCard } from "@/components/shared/ListingCard";
import { ActiveFilterChips } from "@/features/listings/components/ActiveFilterChips";
import { ListingSearchBox } from "@/features/listings/components/ListingSearchBox";
import { SortSelect } from "@/features/listings/components/SortSelect";
import {
  CONDITION_OPTIONS,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";
import { sortCategoriesOtherLast } from "@/features/listings/lib/sort-categories";

const PAGE_SIZE = 24;

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    suitableFor?: string;
    condition?: string;
    brand?: string;
    color?: string;
    size?: string;
    state?: string;
    lga?: string;
    freeOnly?: string;
    verifiedOnly?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ListingsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug, parent_id")
    .order("name");

  const category = categories?.find((c) => c.slug === params.category);
  const subcategory = categories?.find((c) => c.slug === params.subcategory);
  const conditionLabel = CONDITION_OPTIONS.find((c) => c.value === params.condition)?.label;
  const location = [params.lga, params.state].filter(Boolean).join(", ");

  const subject = subcategory?.name ?? category?.name;
  const subjectLower = subject?.toLowerCase();

  let title = "Browse listings";
  let description =
    "Browse secondhand clothes, shoes, bags, and more for sale or free across Nigeria on Threddo.";

  if (subject && location) {
    title = `${subject} for sale in ${location}`;
    description = `Shop ${subjectLower} — secondhand and new, for sale or free — in ${location} on Threddo.`;
  } else if (subcategory && category) {
    title = `${subcategory.name} — ${category.name}`;
    description = `Shop ${subjectLower} in ${category.name.toLowerCase()} — secondhand and new, for sale or free, near you in Nigeria.`;
  } else if (category) {
    title = `${category.name} for sale in Nigeria`;
    description = `Browse ${category.name.toLowerCase()} — secondhand and new, for sale or free, near you in Nigeria.`;
  } else if (location) {
    title = `Secondhand fashion for sale in ${location}`;
    description = `Browse clothes, shoes, bags, and more for sale or free in ${location} on Threddo.`;
  } else if (params.q) {
    title = `"${params.q}" — search results`;
    description = `Results for "${params.q}" on Threddo — secondhand fashion marketplace in Nigeria.`;
  }

  if (conditionLabel && subject) {
    title = `${conditionLabel} ${subjectLower} for sale${location ? ` in ${location}` : " in Nigeria"}`;
  }

  // The clean, "canonical" dimensions of a listings page worth ranking on
  // their own. Category/subcategory, condition, and location (state/lga) are
  // real, search-worthy landing pages for a Nigeria-wide marketplace — e.g.
  // "clothes for sale in Lagos" — so they stay indexable. Free-text search,
  // price range, brand/color/size, sort, and pagination create near-infinite
  // low-value combinations instead, so those get folded into the canonical
  // version rather than indexed separately.
  const canonicalParams = new URLSearchParams();
  if (params.category) canonicalParams.set("category", params.category);
  if (params.subcategory) canonicalParams.set("subcategory", params.subcategory);
  if (params.suitableFor) canonicalParams.set("suitableFor", params.suitableFor);
  if (params.freeOnly) canonicalParams.set("freeOnly", params.freeOnly);
  if (params.condition) canonicalParams.set("condition", params.condition);
  if (params.state) canonicalParams.set("state", params.state);
  if (params.lga) canonicalParams.set("lga", params.lga);
  const canonicalQuery = canonicalParams.toString();
  const canonical = `/listings${canonicalQuery ? `?${canonicalQuery}` : ""}`;

  const hasNoiseParams = Boolean(
    params.q ||
    params.brand ||
    params.color ||
    params.size ||
    params.minPrice ||
    params.maxPrice ||
    params.verifiedOnly ||
    (params.page && params.page !== "1")
  );

  return {
    title,
    description,
    alternates: { canonical },
    robots: hasNoiseParams ? { index: false, follow: true } : { index: true, follow: true }
  };
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
  const subcategoriesOfCategory = category
    ? sortCategoriesOtherLast((categories ?? []).filter((c) => c.parent_id === category.id))
    : [];

  const selectColumns = "id, title, price, is_free, condition, state, lga, images, is_sold";
  let query =
    params.verifiedOnly === "1"
      ? supabase
          .from("listings")
          .select(`${selectColumns}, seller:profiles!listings_user_id_fkey!inner(is_verified)`, {
            count: "exact"
          })
          .eq("seller.is_verified", true)
      : supabase.from("listings").select(selectColumns, { count: "exact" });

  query = query.eq("status", "approved");

  if (subcategory) {
    query = query.eq("category_id", subcategory.id);
  } else if (category) {
    const childIds = (categories ?? []).filter((c) => c.parent_id === category.id).map((c) => c.id);
    query = query.in("category_id", [category.id, ...childIds]);
  }

  if (params.state) query = query.eq("state", params.state);
  if (params.lga) query = query.eq("lga", params.lga);
  if (params.suitableFor && SUITABLE_FOR_OPTIONS.some((o) => o.value === params.suitableFor)) {
    query = query.eq("suitable_for", params.suitableFor as SuitableFor);
  }
  if (params.condition && CONDITION_OPTIONS.some((o) => o.value === params.condition)) {
    query = query.eq("condition", params.condition as (typeof CONDITION_OPTIONS)[number]["value"]);
  }
  if (params.brand?.trim()) query = query.ilike("brand", `%${params.brand.trim()}%`);
  if (params.color?.trim()) query = query.ilike("color", `%${params.color.trim()}%`);
  if (params.size?.trim()) query = query.ilike("size", `%${params.size.trim()}%`);
  if (params.q?.trim()) {
    const term = params.q.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (params.freeOnly === "1") {
    query = query.eq("is_free", true);
  } else {
    if (params.minPrice) query = query.gte("price", Number(params.minPrice));
    if (params.maxPrice) query = query.lte("price", Number(params.maxPrice));
  }

  if (params.sort === "price_asc")
    query = query.order("price", { ascending: true, nullsFirst: true });
  else if (params.sort === "price_desc")
    query = query.order("price", { ascending: false, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });

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

  const carryParams = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q: params.q,
      category: params.category,
      subcategory: params.subcategory,
      suitableFor: params.suitableFor,
      condition: params.condition,
      brand: params.brand,
      color: params.color,
      size: params.size,
      state: params.state,
      lga: params.lga,
      freeOnly: params.freeOnly,
      verifiedOnly: params.verifiedOnly,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sort: params.sort,
      ...overrides
    };
    for (const [key, value] of Object.entries(base)) {
      if (value) next.set(key, value);
    }
    return next;
  };

  const pageLink = (targetPage: number) =>
    `/listings?${carryParams({ page: String(targetPage) }).toString()}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 pb-24 sm:pb-8">
      <Breadcrumbs
        items={[
          { name: "Browse listings", href: category ? "/listings" : undefined },
          ...(category
            ? [
                {
                  name: category.name,
                  href: subcategory ? `/listings?category=${category.slug}` : undefined
                }
              ]
            : []),
          ...(subcategory && category ? [{ name: subcategory.name }] : [])
        ]}
      />

      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Browse listings
      </h1>

      <div className="mt-4 grid gap-3">
        <ListingSearchBox />

        {category ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href={`/listings?${carryParams({ category: params.category, subcategory: undefined }).toString()}`}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap ${
                !subcategory
                  ? "border-[#1B1F3B] bg-[#1B1F3B] text-white"
                  : "border-black/10 bg-white text-[#1B1F3B] hover:bg-black/5"
              }`}
            >
              All {category.name}
            </Link>
            {subcategoriesOfCategory.map((sub) => (
              <Link
                key={sub.slug}
                href={`/listings?${carryParams({ subcategory: sub.slug }).toString()}`}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap ${
                  params.subcategory === sub.slug
                    ? "border-[#1B1F3B] bg-[#1B1F3B] text-white"
                    : "border-black/10 bg-white text-[#1B1F3B] hover:bg-black/5"
                }`}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        ) : null}

        <ActiveFilterChips />

        <div className="flex items-center justify-between">
          <p className="text-sm text-black/60">
            Found {count ?? 0} ad{count === 1 ? "" : "s"}
            {params.q ? (
              <>
                {" "}
                for &ldquo;<span className="font-medium text-[#1B1F3B]">{params.q}</span>&rdquo;
              </>
            ) : null}
          </p>
          <SortSelect />
        </div>
      </div>

      <div className="mt-6">
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                isFree={listing.is_free}
                condition={listing.condition}
                state={listing.state}
                lga={listing.lga}
                images={listing.images ?? []}
                isSaved={user ? savedIds.has(listing.id) : undefined}
                isSold={listing.is_sold}
                priority={index === 0 && page === 1}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[#1B1F3B]/15 py-12 text-center">
            <p className="text-black/60">No listings match these filters yet.</p>
            <Link
              href="/listings"
              className="rounded-full bg-[#1B1F3B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B1F3B]/90"
            >
              Clear all filters
            </Link>
          </div>
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
    </main>
  );
}
