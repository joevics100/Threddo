export interface ListingDetailSection {
  title: string;
  body: string;
}

/** Safely narrows the jsonb column to a clean list of sections (or an empty list). */
export function parseDetailSections(value: unknown): ListingDetailSection[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { title, body } = item as Record<string, unknown>;
    if (typeof title !== "string" || typeof body !== "string") return [];
    if (!title.trim() || !body.trim()) return [];
    return [{ title: title.trim(), body: body.trim() }];
  });
}
