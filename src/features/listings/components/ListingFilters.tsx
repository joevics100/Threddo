"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CategorySelect, LocationSelect, type CategoryOption } from "@/components/shared";
import { Button, Checkbox, Input } from "@/ui";

interface ListingFiltersProps {
  categories: CategoryOption[];
}

export function ListingFilters({ categories }: ListingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const findBySlug = (slug: string | null) => categories.find((c) => c.slug === slug);

  const initialCategory = findBySlug(searchParams.get("category"));
  const initialSubcategory = findBySlug(searchParams.get("subcategory"));

  const [categoryId, setCategoryId] = useState<string | null>(initialCategory?.id ?? null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(initialSubcategory?.id ?? null);
  const [state, setState] = useState<string | null>(searchParams.get("state"));
  const [lga, setLga] = useState<string | null>(searchParams.get("lga"));
  const [freeOnly, setFreeOnly] = useState(searchParams.get("freeOnly") === "1");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function applyFilters(overrides: Record<string, string | null> = {}) {
    const params = new URLSearchParams();

    const categorySlug = categories.find((c) => c.id === categoryId)?.slug;
    const subcategorySlug = categories.find((c) => c.id === subcategoryId)?.slug;

    const next: Record<string, string | null> = {
      category: categorySlug ?? null,
      subcategory: subcategorySlug ?? null,
      state,
      lga,
      freeOnly: freeOnly ? "1" : null,
      minPrice: freeOnly ? null : minPrice || null,
      maxPrice: freeOnly ? null : maxPrice || null,
      ...overrides
    };

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setCategoryId(null);
    setSubcategoryId(null);
    setState(null);
    setLga(null);
    setFreeOnly(false);
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-black/5 bg-white p-5">
      <CategorySelect
        categories={categories}
        categoryId={categoryId}
        subcategoryId={subcategoryId}
        onCategoryChange={(value) => {
          setCategoryId(value);
          setSubcategoryId(null);
        }}
        onSubcategoryChange={setSubcategoryId}
      />

      <LocationSelect
        state={state}
        lga={lga}
        onStateChange={setState}
        onLgaChange={setLga}
        layout="stack"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Min price (₦)</label>
          <Input
            type="number"
            min={0}
            value={minPrice}
            disabled={freeOnly}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Max price (₦)</label>
          <Input
            type="number"
            min={0}
            value={maxPrice}
            disabled={freeOnly}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={freeOnly}
          onCheckedChange={(checked) => setFreeOnly(checked === true)}
          id="freeOnly"
        />
        <label htmlFor="freeOnly" className="text-sm font-medium">
          Free items only
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => applyFilters()}
          className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
        >
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}
