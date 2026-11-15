// Deliberate visual pairing for the homepage's 2-column category grid, so
// each row groups related categories: Clothing/Shoes, Bags/Jewellery,
// Hair/Accessories, then Other alone. Alphabetical order (used in dropdowns)
// doesn't produce this pairing, so the homepage needs its own fixed order.
const HOMEPAGE_GRID_ORDER = [
  "clothing",
  "shoes",
  "bags",
  "jewellery",
  "hair",
  "accessories",
  "other"
];

/** Orders categories for the homepage grid — falls back to alphabetical for anything not in the known list. */
export function sortCategoriesForHomepageGrid<T extends { name: string }>(categories: T[]): T[] {
  const rank = (name: string) => {
    const lower = name.toLowerCase();
    const index = HOMEPAGE_GRID_ORDER.findIndex((key) => lower.startsWith(key));
    return index === -1 ? HOMEPAGE_GRID_ORDER.length : index;
  };
  return [...categories].sort(
    (a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)
  );
}
