"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { sortCategoriesOtherLast } from "@/features/listings/lib/sort-categories";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface CategorySelectProps {
  categories: CategoryOption[];
  categoryId: string | null;
  subcategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  disabled?: boolean;
}

/**
 * Reusable category → subcategory cascading picker. Pass it the full flat
 * category list (top-level rows have `parent_id: null`); it derives the
 * subcategory options from whichever top-level category is selected.
 *
 * Used on the "post a listing" form and, later, the browse/filter bar —
 * same component, same data shape, both places.
 */
export function CategorySelect({
  categories,
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  disabled
}: CategorySelectProps) {
  const topLevel = sortCategoriesOtherLast(categories.filter((c) => !c.parent_id));
  const subcategories = categories.filter((c) => c.parent_id === categoryId);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={categoryId ?? undefined}
          onValueChange={(value) => {
            onCategoryChange(value);
            onSubcategoryChange(null);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {topLevel.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Subcategory</label>
        <Select
          value={subcategoryId ?? undefined}
          onValueChange={onSubcategoryChange}
          disabled={disabled || !categoryId || subcategories.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={categoryId ? "Select a subcategory" : "Pick a category first"}
            />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
