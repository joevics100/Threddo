import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ListingCard } from "@/components/shared/ListingCard";

export const metadata: Metadata = {
  title: "Saved listings"
};

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/saved");
  }

  const { data: saved } = await supabase
    .from("saved_listings")
    .select(
      "listing_id, listing:listings(id, title, price, is_free, condition, state, lga, images, status)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (saved ?? [])
    .map((row) => row.listing)
    .filter((listing) => listing && listing.status === "approved");

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-6xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Saved listings
      </h1>
      <p className="mt-1 text-black/60">Items you&apos;ve bookmarked to come back to.</p>

      {listings.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing!.id}
              id={listing!.id}
              title={listing!.title}
              price={listing!.price}
              isFree={listing!.is_free}
              condition={listing!.condition}
              state={listing!.state}
              lga={listing!.lga}
              imageUrl={listing!.images?.[0]}
              isSaved
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-black/60">
          Nothing saved yet — tap the heart on any{" "}
          <Link href="/listings" className="font-semibold text-[#E8543D] hover:underline">
            listing
          </Link>{" "}
          to save it here.
        </p>
      )}
    </main>
  );
}
