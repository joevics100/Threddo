"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CategorySelect, LocationSelect, type CategoryOption } from "@/components/shared";
import { Button, Checkbox, Input, SegmentedControl } from "@/ui";
import {
  CONDITION_OPTIONS,
  MATERIAL_OPTIONS,
  SUITABLE_FOR_OPTIONS
} from "@/features/listings/constants/listing-options";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" }
];

interface ListingFiltersFormProps {
  categories: CategoryOption[];
}

export function ListingFiltersForm({ categories }: ListingFiltersFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const findBySlug = (slug: string | null) => categories.find((c) => c.slug === slug);
  const initialCategory = findBySlug(searchParams.get("category"));
  const initialSubcategory = findBySlug(searchParams.get("subcategory"));

  const [categoryId, setCategoryId] = useState<string | null>(initialCategory?.id ?? null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(initialSubcategory?.id ?? null);
  const [state, setState] = useState<string | null>(searchParams.get("state"));
  const [lga, setLga] = useState<string | null>(searchParams.get("lga"));
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [condition, setCondition] = useState<string | undefined>(
    searchParams.get("condition") ?? undefined
  );
  const [size, setSize] = useState(searchParams.get("size") ?? "");
  const [color, setColor] = useState(searchParams.get("color") ?? "");
  const [material, setMaterial] = useState<string | undefined>(
    searchParams.get("material") ?? undefined
  );
  const [suitableFor, setSuitableFor] = useState<string | undefined>(
    searchParams.get("suitableFor") ?? undefined
  );
  const [freeOnly, setFreeOnly] = useState(searchParams.get("freeOnly") === "1");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verifiedOnly") === "1");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");

  function applyFilters() {
    const categorySlug = categories.find((c) => c.id === categoryId)?.slug;
    const subcategorySlug = categories.find((c) => c.id === subcategoryId)?.slug;

    const values: Record<string, string | null> = {
      q: searchParams.get("q"),
      category: categorySlug ?? null,
      subcategory: subcategorySlug ?? null,
      state,
      lga,
      minPrice: freeOnly ? null : minPrice || null,
      maxPrice: freeOnly ? null : maxPrice || null,
      brand: brand || null,
      condition: condition ?? null,
      size: size || null,
      color: color || null,
      material: material ?? null,
      suitableFor: suitableFor ?? null,
      freeOnly: freeOnly ? "1" : null,
      verifiedOnly: verifiedOnly ? "1" : null,
      sort: sort === "newest" ? null : sort
    };

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }

    router.push(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/listings");
  }

  return (
    <div className="grid gap-6 pb-28">
      <div>
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
      </div>

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

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Brand</label>
        <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Zara" />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Condition</label>
        <SegmentedControl
          options={CONDITION_OPTIONS}
          value={condition}
          onValueChange={setCondition}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Size</label>
          <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. L, 42" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Color</label>
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Navy blue"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Material</label>
        <SegmentedControl options={MATERIAL_OPTIONS} value={material} onValueChange={setMaterial} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Suitable for</label>
        <SegmentedControl
          options={SUITABLE_FOR_OPTIONS}
          value={suitableFor}
          onValueChange={setSuitableFor}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Sort by</label>
        <SegmentedControl options={SORT_OPTIONS} value={sort} onValueChange={setSort} />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="freeOnly"
            checked={freeOnly}
            onCheckedChange={(checked) => setFreeOnly(checked === true)}
          />
          <label htmlFor="freeOnly" className="text-sm font-medium">
            Free items only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="verifiedOnly"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
          />
          <label htmlFor="verifiedOnly" className="text-sm font-medium">
            Verified sellers only
          </label>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-black/5 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:sticky sm:bottom-0 sm:rounded-b-2xl">
        <Button type="button" variant="outline" onClick={clearFilters} className="flex-1">
          Clear
        </Button>
        <Button
          type="button"
          onClick={applyFilters}
          className="flex-1 bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
        >
          Show results
        </Button>
      </div>
    </div>
  );
}
