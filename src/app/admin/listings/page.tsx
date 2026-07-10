import Link from "next/link";

import type { ListingStatus } from "@/types/database.types";

import { createClient } from "@/lib/supabase/server";

import {
  ListingModerationRow,
  type ModerationListing
} from "@/features/trust-safety/components/ListingModerationRow";

interface AdminListingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_TABS: { label: string; value: ListingStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" }
];

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const { status: statusParam } = await searchParams;
  const status: ListingStatus = STATUS_TABS.some((t) => t.value === statusParam)
    ? (statusParam as ListingStatus)
    : "pending";

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, price, is_free, condition, state, lga, images, created_at, category:categories!listings_category_id_fkey(name), seller:profiles!listings_user_id_fkey(full_name)"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  const rows: ModerationListing[] = (listings ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    is_free: l.is_free,
    condition: l.condition,
    state: l.state,
    lga: l.lga,
    images: l.images,
    created_at: l.created_at,
    category_name: l.category?.name ?? null,
    seller_name: l.seller?.full_name ?? null
  }));

  return (
    <div>
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/listings?status=${tab.value}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === tab.value
                ? "bg-[#1B1F3B] text-white"
                : "bg-black/5 text-[#1B1F3B] hover:bg-black/10"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {rows.length > 0 ? (
          rows.map((listing) => <ListingModerationRow key={listing.id} listing={listing} />)
        ) : (
          <p className="text-sm text-black/50">No {status} listings.</p>
        )}
      </div>
    </div>
  );
}
