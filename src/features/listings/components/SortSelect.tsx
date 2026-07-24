"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" }
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("sort") ?? "newest"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "newest") params.delete("sort");
        else params.set("sort", e.target.value);
        params.delete("page");
        router.push(`/listings?${params.toString()}`);
      }}
      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#1B1F3B] outline-none focus:ring-2 focus:ring-[#E8A33D]"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          Sort: {option.label}
        </option>
      ))}
    </select>
  );
}
