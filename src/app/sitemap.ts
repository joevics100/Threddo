import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

import { createClient } from "@/lib/supabase/server";

// Sanity ceiling so a runaway listings table can't blow past the 50k-URL
// per-sitemap limit — comfortably far off for a while, and easy to split
// into multiple sitemaps (generateSitemaps) if Threddo ever gets there.
const MAX_LISTINGS_IN_SITEMAP = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: categories }, { data: listings }] = await Promise.all([
    supabase.from("categories").select("id, slug, parent_id").order("name"),
    supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(MAX_LISTINGS_IN_SITEMAP)
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/safety`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 }
  ];

  const slugById = new Map((categories ?? []).map((c) => [c.id, c.slug]));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((category) => {
    const parentSlug = category.parent_id ? slugById.get(category.parent_id) : null;
    const url = parentSlug
      ? `${siteConfig.url}/listings?category=${parentSlug}&subcategory=${category.slug}`
      : `${siteConfig.url}/listings?category=${category.slug}`;
    return {
      url,
      changeFrequency: "daily",
      priority: parentSlug ? 0.6 : 0.8
    };
  });

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((listing) => ({
    url: `${siteConfig.url}/listings/${listing.id}`,
    lastModified: listing.updated_at,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
