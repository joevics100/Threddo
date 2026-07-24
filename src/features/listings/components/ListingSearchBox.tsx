"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Search } from "lucide-react";

export function ListingSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function submit() {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
      <Search className="size-5 shrink-0 text-[#1B1F3B]/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Search listings"
        className="w-full bg-transparent text-sm text-[#1B1F3B] outline-none placeholder:text-[#1B1F3B]/40"
      />
    </div>
  );
}
