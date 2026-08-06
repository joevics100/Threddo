import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site.config";

import { JsonLd } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

import { CategoryCard } from "@/components/shared/CategoryCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { HomeSearchBar } from "@/features/listings/components/HomeSearchBar";
import { sortCategoriesForHomepageGrid } from "@/features/listings/lib/sort-categories";

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

const QUICK_FILTERS = [
  { label: "Female", href: "/listings?suitableFor=female" },
  { label: "Male", href: "/listings?suitableFor=male" },
  { label: "Kids", href: "/listings?suitableFor=kids" },
  { label: "Unisex", href: "/listings?suitableFor=unisex" },
  { label: "Donations", href: "/listings?freeOnly=1" }
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: listings }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    supabase
      .from("listings")
      .select("id, title, price, is_free, condition, state, lga, images")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  let savedIds = new Set<string>();
  if (user) {
    const { data: saved } = await supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id);
    savedIds = new Set((saved ?? []).map((s) => s.listing_id));
  }

  const topLevelCategories = sortCategoriesForHomepageGrid(
    (categories ?? []).filter((c) => !c.parent_id)
  );
  const subcategoryCount = new Map<string, number>();
  for (const category of categories ?? []) {
    if (category.parent_id) {
      subcategoryCount.set(category.parent_id, (subcategoryCount.get(category.parent_id) ?? 0) + 1);
    }
  }

  return (
    <main className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          description: siteConfig.description
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/listings?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-[#1B1F3B] bg-cover bg-[center_top_15%] text-white"
        style={{ backgroundImage: "url(/hero.jpg)" }}
      >
        {/* Gradient overlay so text/search bar stay readable against the bright photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1B1F3B]/75 via-[#1B1F3B]/55 to-[#1B1F3B]/90"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E8A33D] opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#E8543D] opacity-10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-10 text-center md:py-14">
          <h1 className="max-w-2xl text-3xl leading-[1.1] font-[var(--font-display)] font-bold tracking-tight md:text-6xl">
            Give away your old clothes or sell it fast
          </h1>

          <div className="mt-6 w-full max-w-xl">
            <HomeSearchBar />
          </div>

          <div className="mt-4 flex w-full [scrollbar-width:none] gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_FILTERS.map((filter) => (
              <Link
                key={filter.label}
                href={filter.href}
                className="shrink-0 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-sm font-medium whitespace-nowrap text-white/85 transition hover:border-white/50 hover:bg-white/10"
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          What are you looking for?
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {topLevelCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              slug={category.slug}
              count={
                subcategoryCount.get(category.id)
                  ? `${subcategoryCount.get(category.id)} subcategories`
                  : "Browse now"
              }
            />
          ))}
        </div>
      </section>

      {/* Recent listings */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
              Fresh on Threddo
            </h2>
            <Link href="/listings" className="text-sm font-semibold text-[#E8543D] hover:underline">
              See all →
            </Link>
          </div>

          {listings && listings.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mt-8 text-[#1B1F3B]/60">
              No listings yet — be the first to{" "}
              <Link href="/post" className="font-semibold text-[#E8543D] hover:underline">
                post an item
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {/* Quick pitch — what you're actually getting, in one glance */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-[var(--font-display)] font-bold text-[#E8A33D]">₦0</p>
            <p className="mt-1 font-semibold text-[#1B1F3B]">Fees, ever</p>
            <p className="mt-1 text-sm text-[#1B1F3B]/60">No commission on any sale.</p>
          </div>
          <div>
            <p className="text-3xl font-[var(--font-display)] font-bold text-[#E8A33D]">💬</p>
            <p className="mt-1 font-semibold text-[#1B1F3B]">Straight to WhatsApp</p>
            <p className="mt-1 text-sm text-[#1B1F3B]/60">Buyers message you directly.</p>
          </div>
          <div>
            <p className="text-3xl font-[var(--font-display)] font-bold text-[#E8A33D]">🎁</p>
            <p className="mt-1 font-semibold text-[#1B1F3B]">Sell or donate</p>
            <p className="mt-1 text-sm text-[#1B1F3B]/60">Your choice, on every listing.</p>
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbering earns its place */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          How Threddo works
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Post your item",
              body: "Snap a few photos, set your price (or mark it free), and choose your state and town."
            },
            {
              step: "02",
              title: "Get contacted directly",
              body: "Interested buyers reach you straight on WhatsApp or by phone — no waiting on site messages."
            },
            {
              step: "03",
              title: "Meet and hand over",
              body: "Agree on a safe public spot nearby. Need extra trust? Use our simple WhatsApp escrow."
            }
          ].map((s) => (
            <div key={s.step}>
              <span className="text-4xl font-[var(--font-display)] font-bold text-[#E8A33D]">
                {s.step}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-[#1B1F3B]">{s.title}</h3>
              <p className="mt-2 text-[#1B1F3B]/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety banner */}
      <section className="bg-[#1B1F3B] py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-2xl font-[var(--font-display)] font-bold text-white">
            Stay safe while you trade
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Always meet in a public place, inspect items before paying, and never send money upfront
            to a stranger. If a deal feels off, trust that feeling.
          </p>
          <Link
            href="/safety"
            className="mt-5 inline-block text-sm font-semibold text-[#E8A33D] hover:underline"
          >
            Read our full safety guide →
          </Link>
        </div>
      </section>
    </main>
  );
}
