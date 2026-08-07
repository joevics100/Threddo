import { siteConfig } from "@/config/site.config";

/** Turns a site-relative path into a full absolute URL using the canonical domain. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path, e.g. "/listings?category=clothes". Omit for the current page (last crumb). */
  href?: string;
}

/** Builds a schema.org BreadcrumbList JSON-LD object from an ordered list of crumbs. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {})
    }))
  };
}

export interface ProductJsonLdInput {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  price: number | null;
  isFree: boolean;
  /** Threddo's condition values — mapped to schema.org's condition enum. */
  condition: string;
  brand: string | null;
  category: string | null;
  isSold?: boolean;
}

const CONDITION_SCHEMA_MAP: Record<string, string> = {
  new: "https://schema.org/NewCondition",
  like_new: "https://schema.org/NewCondition",
  gently_used: "https://schema.org/UsedCondition",
  needs_fixing: "https://schema.org/DamagedCondition"
};

/**
 * Builds a schema.org Product JSON-LD object for a listing. Deliberately
 * leaves out `aggregateRating` — Threddo's reviews are of the *seller*, not
 * of this specific item, so attaching them here would misrepresent what the
 * rating covers (against Google's structured data guidelines).
 */
export function productJsonLd(listing: ProductJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || listing.title,
    image: listing.images,
    ...(listing.brand ? { brand: { "@type": "Brand", name: listing.brand } } : {}),
    ...(listing.category ? { category: listing.category } : {}),
    itemCondition: CONDITION_SCHEMA_MAP[listing.condition] ?? "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/listings/${listing.id}`),
      priceCurrency: "NGN",
      price: listing.isFree ? "0" : String(listing.price ?? "0"),
      availability: listing.isSold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    }
  };
}

/** Renders a JSON-LD object into a <script> tag. Safe against injection since JSON.stringify escapes quotes/control chars. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
