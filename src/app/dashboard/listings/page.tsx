import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Pencil, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { DeleteListingButton } from "@/features/listings/components/DeleteListingButton";
import { formatNaira } from "@/features/listings/lib/format";

export const metadata: Metadata = {
  title: "My listings",
  robots: { index: false, follow: false }
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#E8A33D]/10 text-[#E8A33D]",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive"
};

interface MyListingsPageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const { updated } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/listings");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, is_free, status, rejection_reason, images")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          My listings
        </h1>
        <Link
          href="/post"
          className="flex items-center gap-1.5 rounded-lg bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
        >
          <Plus className="size-4" />
          Post
        </Link>
      </div>

      {updated ? (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Your changes were saved and are back under review.
        </div>
      ) : null}

      {listings && listings.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center"
            >
              <Link href={`/listings/${listing.id}`} className="flex flex-1 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#1B1F3B]">{listing.title}</p>
                  <p className="text-sm text-black/60">
                    {formatNaira(listing.is_free ? null : listing.price)}
                  </p>
                  {listing.status === "rejected" && listing.rejection_reason ? (
                    <p className="mt-1 text-xs text-destructive">
                      Reason: {listing.rejection_reason}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[listing.status] ?? "bg-black/5 text-black/60"
                  }`}
                >
                  {listing.status}
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                <Link
                  href={`/listings/${listing.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#1B1F3B] transition hover:bg-black/5"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
                <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm text-black/60">
            You haven&apos;t posted anything yet.{" "}
            <Link href="/post" className="font-semibold text-[#E8543D] hover:underline">
              Post your first item
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
