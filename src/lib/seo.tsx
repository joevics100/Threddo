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
  /** The individual seller's display name — Threddo is a marketplace, not the merchant, so the offer is attributed to them, not to Threddo. */
  sellerName: string | null;
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
 *
 * Threddo is a marketplace, not the merchant — every offer is attributed to
 * the individual seller via `offers.seller`, and the return policy describes
 * that seller's practice (no formal post-sale returns), not a platform-wide
 * guarantee from Threddo itself.
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
    // Secondhand P2P listings never have a GTIN/MPN — this is Google's
    // documented way to say "no global identifier exists" instead of
    // triggering the missing-identifier warning.
    identifier_exists: false,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/listings/${listing.id}`),
      priceCurrency: "NGN",
      price: listing.isFree ? "0" : String(listing.price ?? "0"),
      availability: listing.isSold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      // Threddo is the marketplace, not the party selling this item.
      ...(listing.sellerName ? { seller: { "@type": "Person", name: listing.sellerName } } : {}),
      // Reflects the individual seller's practice, not a Threddo-wide policy
      // — Threddo has no mechanism for a buyer to return an item to the
      // seller after a sale completes.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"
      },
      // Placeholder — Threddo doesn't arrange or price shipping itself;
      // delivery (if any) is negotiated directly between buyer and seller
      // off-platform (WhatsApp). This satisfies the required field without
      // representing a real Threddo shipping service.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "NGN" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "NG" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 3, unitCode: "DAY" }
        }
      }
    }
  };
}

/** Renders a JSON-LD object into a <script> tag. Safe against injection since JSON.stringify escapes quotes/control chars. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
