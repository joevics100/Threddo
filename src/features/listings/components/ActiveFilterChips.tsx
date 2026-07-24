"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { SlidersHorizontal, X } from "lucide-react";

import {
  CONDITION_OPTIONS,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";

interface Chip {
  key: string;
  label: string;
}

/**
 * Shows one removable pill per active filter (everything except category/
 * subcategory, which already has its own quick-pill row above this one) and
 * a "Filters" button that opens the dedicated /listings/filters page.
 */
export function ActiveFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips: Chip[] = [];

  const state = searchParams.get("state");
  const lga = searchParams.get("lga");
  if (lga) chips.push({ key: "lga", label: lga });
  else if (state) chips.push({ key: "state", label: state });

  if (searchParams.get("freeOnly") === "1") {
    chips.push({ key: "freeOnly", label: "Free only" });
  } else {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      chips.push({
        key: "price",
        label: `₦${minPrice || "0"} - ${maxPrice ? `₦${maxPrice}` : "Any"}`
      });
    }
  }

  const suitableFor = searchParams.get("suitableFor");
  if (suitableFor) {
    chips.push({
      key: "suitableFor",
      label: SUITABLE_FOR_OPTIONS.find((o) => o.value === suitableFor)?.label ?? suitableFor
    });
  }

  const condition = searchParams.get("condition");
  if (condition) {
    chips.push({
      key: "condition",
      label: CONDITION_OPTIONS.find((o) => o.value === condition)?.label ?? condition
    });
  }

  const brand = searchParams.get("brand");
  if (brand) chips.push({ key: "brand", label: brand });

  const color = searchParams.get("color");
  if (color) chips.push({ key: "color", label: color });

  const size = searchParams.get("size");
  if (size) chips.push({ key: "size", label: `Size ${size}` });

  if (searchParams.get("verifiedOnly") === "1") {
    chips.push({ key: "verifiedOnly", label: "Verified sellers" });
  }

  function removeChip(chip: Chip) {
    const params = new URLSearchParams(searchParams.toString());
    if (chip.key === "state") {
      params.delete("state");
      params.delete("lga");
    } else if (chip.key === "lga") {
      params.delete("lga");
    } else if (chip.key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(chip.key);
    }
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip)}
          className="flex items-center gap-1.5 rounded-full border border-[#1B1F3B]/20 bg-[#1B1F3B]/5 px-3 py-1.5 text-xs font-medium text-[#1B1F3B]"
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}

      <Link
        href={`/listings/filters?${searchParams.toString()}`}
        className="flex items-center gap-1.5 rounded-full border border-[#1B1F3B]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#1B1F3B] hover:bg-black/5"
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
      </Link>
    </div>
  );
}
