import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { formatNaira } from "@/features/listings/lib/format";

export const metadata: Metadata = {
  title: "Dashboard"
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#E8A33D]/10 text-[#E8A33D]",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive"
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Middleware already guards this route, but a server component should never
  // trust that alone — re-check here in case middleware config ever changes.
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("listings")
      .select("id, title, price, is_free, status, rejection_reason, images")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-2 text-black/60">{user.email}</p>
        </div>
        <Link
          href="/post"
          className="rounded-lg bg-[#E8A33D] px-5 py-2.5 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
        >
          Post an item
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#1B1F3B]">Your listings</h2>

        {listings && listings.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 transition hover:shadow-sm"
              >
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
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-black/60">
              You haven&apos;t posted anything yet.{" "}
              <Link href="/post" className="font-semibold text-[#E8543D] hover:underline">
                Post your first item
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
