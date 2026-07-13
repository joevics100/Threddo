import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env } from "@/env";

import { timeAgo } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

import { ListingCard } from "@/components/shared/ListingCard";
import { ListingImageGallery } from "@/features/listings/components/ListingImageGallery";
import { SaveButton } from "@/features/listings/components/SaveButton";
import { ShareButton } from "@/features/listings/components/ShareButton";
import {
  buildWhatsAppLink,
  formatNaira,
  getConditionLabel,
  getDeliveryMethodLabel
} from "@/features/listings/lib/format";
import { SellerCard } from "@/features/sellers";
import {
  EscrowDialog,
  ReportListingDialog,
  ReviewForm,
  SellerReviews
} from "@/features/trust-safety";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "*, category:categories!listings_category_id_fkey(name), seller:profiles!listings_user_id_fkey(full_name, whatsapp_number, phone, avatar_url, is_verified, created_at)"
    )
    .eq("id", id)
    .single();

  return listing;
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return { title: listing?.title ?? "Listing" };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (listing.status === "approved") {
    // Fire-and-forget — a failed view-count bump shouldn't block the page.
    void supabase.rpc("increment_listing_views", { listing_id: listing.id });
  }

  let isSaved: boolean | undefined;
  if (user) {
    const { data: saved } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    isSaved = Boolean(saved);
  }

  const { data: similar } = await supabase
    .from("listings")
    .select("id, title, price, is_free, condition, state, lga, images")
    .eq("category_id", listing.category_id)
    .eq("status", "approved")
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const sellerNumber =
    listing.whatsapp_number || listing.seller?.whatsapp_number || listing.seller?.phone || "";
  const whatsappLink = sellerNumber
    ? buildWhatsAppLink(
        sellerNumber,
        `Hi, I'm interested in your listing "${listing.title}" on Threddo.`
      )
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 pb-24 sm:pb-12">
      {listing.status !== "approved" ? (
        <div className="mb-6 rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-4 py-2 text-sm font-medium text-[#1B1F3B]">
          {listing.status === "pending"
            ? "This listing is awaiting admin approval — only you can see this page."
            : "This listing was rejected — only you can see this page."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ListingImageGallery images={listing.images ?? []} title={listing.title} />

        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                  listing.is_free
                    ? "bg-[#1B1F3B]/10 text-[#1B1F3B]"
                    : "bg-[#E8543D]/10 text-[#E8543D]"
                }`}
              >
                {listing.is_free ? "Free" : "For sale"}
              </span>
              {listing.is_negotiable ? (
                <span className="inline-block rounded-full bg-[#E8A33D]/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#E8A33D] uppercase">
                  Negotiable
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {isSaved !== undefined ? (
                <SaveButton listingId={listing.id} initialSaved={isSaved} />
              ) : null}
              <ShareButton
                title={listing.title}
                url={`${env.NEXT_PUBLIC_SITE_URL}/listings/${listing.id}`}
              />
            </div>
          </div>

          <h1 className="mt-2 text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            {listing.title}
          </h1>
          <p className="mt-1 text-xl font-bold text-[#1B1F3B]">
            {formatNaira(listing.is_free ? null : listing.price)}
          </p>
          <p className="mt-1 text-xs text-black/40">Posted {timeAgo(listing.created_at)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-black/50">Category</dt>
            <dd className="text-[#1B1F3B]">{listing.category?.name ?? "—"}</dd>

            <dt className="text-black/50">Condition</dt>
            <dd className="text-[#1B1F3B]">{getConditionLabel(listing.condition)}</dd>

            {listing.size ? (
              <>
                <dt className="text-black/50">Size</dt>
                <dd className="text-[#1B1F3B]">{listing.size}</dd>
              </>
            ) : null}

            {listing.color ? (
              <>
                <dt className="text-black/50">Color</dt>
                <dd className="text-[#1B1F3B]">{listing.color}</dd>
              </>
            ) : null}

            {listing.brand ? (
              <>
                <dt className="text-black/50">Brand</dt>
                <dd className="text-[#1B1F3B]">{listing.brand}</dd>
              </>
            ) : null}

            {listing.material ? (
              <>
                <dt className="text-black/50">Material</dt>
                <dd className="text-[#1B1F3B]">{listing.material}</dd>
              </>
            ) : null}

            <dt className="text-black/50">Location</dt>
            <dd className="text-[#1B1F3B]">
              {[listing.town, listing.lga, listing.state].filter(Boolean).join(", ")}
            </dd>

            {listing.delivery_method ? (
              <>
                <dt className="text-black/50">Delivery</dt>
                <dd className="text-[#1B1F3B]">
                  {getDeliveryMethodLabel(listing.delivery_method)}
                </dd>
              </>
            ) : null}
          </dl>

          {listing.description ? (
            <p className="mt-6 text-sm whitespace-pre-line text-[#1B1F3B]/80">
              {listing.description}
            </p>
          ) : null}

          <div className="mt-6">
            <SellerCard
              sellerId={listing.user_id}
              name={listing.seller?.full_name ?? null}
              avatarUrl={listing.seller?.avatar_url}
              isVerified={listing.seller?.is_verified}
              memberSince={listing.seller?.created_at}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Chat on WhatsApp
              </a>
            ) : null}
            {listing.allow_calls && sellerNumber ? (
              <a
                href={`tel:${sellerNumber}`}
                className="rounded-lg border border-[#1B1F3B]/20 px-6 py-3 font-semibold text-[#1B1F3B] transition hover:bg-[#1B1F3B]/5"
              >
                Call seller
              </a>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <EscrowDialog />
            <ReportListingDialog listingId={listing.id} />
          </div>

          <p className="mt-6 text-xs text-black/40">
            Always meet in a public place and inspect items before paying. Never send money upfront
            to a stranger.
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-black/5 pt-8">
        <h2 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Seller reviews
        </h2>
        <div className="mt-4">
          <SellerReviews sellerId={listing.user_id} />
        </div>

        {user && user.id !== listing.user_id ? (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h3 className="text-sm font-semibold text-[#1B1F3B]">Leave a review</h3>
            <div className="mt-3">
              <ReviewForm listingId={listing.id} sellerId={listing.user_id} />
            </div>
          </div>
        ) : null}
      </div>

      {similar && similar.length > 0 ? (
        <div className="mt-12 border-t border-black/5 pt-8">
          <h2 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            Similar listings
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                isFree={item.is_free}
                condition={item.condition}
                state={item.state}
                lga={item.lga}
                imageUrl={item.images?.[0]}
              />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
