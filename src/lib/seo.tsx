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

export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
