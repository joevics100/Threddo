import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { ListingFiltersForm } from "@/features/listings/components/ListingFiltersForm";

export const metadata: Metadata = {
  title: "Filter results"
};

export default async function ListingFiltersPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");

  return (
    <main className="mx-auto max-w-lg px-6 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/listings"
          aria-label="Back to listings"
          className="rounded-full p-1.5 hover:bg-black/5"
        >
          <ArrowLeft className="size-5 text-[#1B1F3B]" />
        </Link>
        <h1 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Filter results
        </h1>
      </div>

      <div className="mt-6">
        <ListingFiltersForm categories={categories ?? []} />
      </div>
    </main>
  );
}
