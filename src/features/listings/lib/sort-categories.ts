/** Keeps a category list alphabetical, but always pushes "Other"/"Others" last. */
export function sortCategoriesOtherLast<T extends { name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    const aIsOther = a.name.toLowerCase().startsWith("other");
    const bIsOther = b.name.toLowerCase().startsWith("other");
    if (aIsOther && !bIsOther) return 1;
    if (!aIsOther && bIsOther) return -1;
    return a.name.localeCompare(b.name);
  });
}
