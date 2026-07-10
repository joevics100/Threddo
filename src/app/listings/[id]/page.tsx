import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  buildWhatsAppLink,
  formatNaira,
  getConditionLabel,
  getDeliveryMethodLabel
} from "@/features/listings/lib/format";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "*, category:categories!listings_category_id_fkey(name), seller:profiles!listings_user_id_fkey(full_name, whatsapp_number, phone)"
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

  if (listing.status === "approved") {
    // Fire-and-forget — a failed view-count bump shouldn't block the page.
    void supabase.rpc("increment_listing_views", { listing_id: listing.id });
  }

  const sellerNumber = listing.seller?.whatsapp_number || listing.seller?.phone || "";
  const whatsappLink = sellerNumber
    ? buildWhatsAppLink(
        sellerNumber,
        `Hi, I'm interested in your listing "${listing.title}" on Threddo.`
      )
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {listing.status !== "approved" ? (
        <div className="mb-6 rounded-lg border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-4 py-2 text-sm font-medium text-[#1B1F3B]">
          {listing.status === "pending"
            ? "This listing is awaiting admin approval — only you can see this page."
            : "This listing was rejected — only you can see this page."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="grid gap-2">
          {listing.images && listing.images.length > 0 ? (
            <>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1B1F3B]/5">
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              {listing.images.length > 1 ? (
                <div className="grid grid-cols-3 gap-2">
                  {listing.images.slice(1).map((url: string) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-lg bg-[#1B1F3B]/5"
                    >
                      <Image
                        src={url}
                        alt={listing.title}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-[#1B1F3B]/5 text-sm text-[#1B1F3B]/40">
              No photos
            </div>
          )}
        </div>

        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
              listing.is_free ? "bg-[#1B1F3B]/10 text-[#1B1F3B]" : "bg-[#E8543D]/10 text-[#E8543D]"
            }`}
          >
            {listing.is_free ? "Free" : "For sale"}
          </span>

          <h1 className="mt-2 text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            {listing.title}
          </h1>
          <p className="mt-1 text-xl font-bold text-[#1B1F3B]">
            {formatNaira(listing.is_free ? null : listing.price)}
          </p>

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
              {[listing.lga, listing.state].filter(Boolean).join(", ")}
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

          <p className="mt-6 text-sm text-black/50">
            Posted by {listing.seller?.full_name ?? "a Threddo user"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
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

          <p className="mt-6 text-xs text-black/40">
            Always meet in a public place and inspect items before paying. Never send money upfront
            to a stranger.
          </p>
        </div>
      </div>
    </main>
  );
}
