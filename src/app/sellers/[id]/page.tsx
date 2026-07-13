import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BadgeCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { SellerAvatar } from "@/components/shared";
import { ListingCard } from "@/components/shared/ListingCard";
import { SellerReviews } from "@/features/trust-safety";

interface SellerProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getSeller(id: string) {
  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, is_verified, created_at")
    .eq("id", id)
    .single();
  return seller;
}

export async function generateMetadata({ params }: SellerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSeller(id);
  return { title: seller?.full_name ? `${seller.full_name} — Seller profile` : "Seller profile" };
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { id } = await params;
  const seller = await getSeller(id);

  if (!seller) {
    notFound();
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, is_free, condition, state, lga, images")
    .eq("user_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const memberSinceYear = new Date(seller.created_at).getFullYear();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 pb-24 sm:pb-12">
      <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-6">
        <SellerAvatar name={seller.full_name} avatarUrl={seller.avatar_url} size={64} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
              {seller.full_name ?? "Threddo user"}
            </h1>
            {seller.is_verified ? (
              <BadgeCheck
                className="size-5 fill-[#1B1F3B] text-white"
                aria-label="Verified seller"
              />
            ) : null}
          </div>
          <p className="text-sm text-black/50">Member since {memberSinceYear}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Listings ({listings?.length ?? 0})
        </h2>
        {listings && listings.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-black/50">No active listings right now.</p>
        )}
      </section>

      <section className="mt-8 border-t border-black/5 pt-8">
        <h2 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Reviews</h2>
        <div className="mt-4">
          <SellerReviews sellerId={id} />
        </div>
      </section>
    </main>
  );
}
