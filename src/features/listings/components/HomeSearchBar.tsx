"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Search } from "lucide-react";

import { NIGERIAN_LGAS, NIGERIAN_STATES } from "@/data/nigeria-locations";

const selectClass =
  "rounded-lg border-0 bg-transparent px-2 py-2 text-sm text-[#1B1F3B] outline-none focus:ring-2 focus:ring-[#E8A33D]";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");

  const lgas = state ? (NIGERIAN_LGAS[state] ?? []) : [];

  function goToListings(overrides: { state?: string; lga?: string } = {}) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());

    const effectiveState = overrides.state ?? state;
    const effectiveLga = overrides.lga ?? lga;
    if (effectiveState) params.set("state", effectiveState);
    if (effectiveLga) params.set("lga", effectiveLga);

    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white p-2 shadow-lg sm:flex sm:items-center sm:gap-1">
      <div className="flex flex-1 items-center gap-2 px-2 py-1.5">
        <Search className="size-5 shrink-0 text-[#1B1F3B]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToListings();
          }}
          placeholder="What are you looking for?"
          className="w-full bg-transparent text-sm text-[#1B1F3B] outline-none placeholder:text-[#1B1F3B]/40"
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1 border-t border-black/5 pt-2 sm:mt-0 sm:flex sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setLga("");
          }}
          className={selectClass}
        >
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={lga}
          disabled={!state}
          onChange={(e) => {
            const value = e.target.value;
            setLga(value);
            // Selecting an LGA (including "All areas") takes the person
            // straight to the filtered browse page.
            goToListings({ state, lga: value });
          }}
          className={`${selectClass} disabled:opacity-40`}
        >
          <option value="">All areas</option>
          {lgas.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => goToListings()}
        className="mt-2 w-full rounded-lg bg-[#E8A33D] px-5 py-2 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563] sm:mt-0 sm:w-auto"
      >
        Search
      </button>
    </div>
  );
}
