import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

import { createClient } from "@/lib/supabase/server";

// Individual listing pages and category/subcategory filter pages are
// deliberately NOT included here yet:
//  - Listings are transient (sold items get removed) and, at current
//    volume, mostly thin/duplicate content — indexing them now would
//    burn crawl budget on pages that churn out from under Google.
//  - Category pages have the same thin-content problem while there are
//    only a handful of listings per category.
// Once there's enough steady listing volume, reintroduce category routes
// first (they're stable URLs, unlike individual listings), gated by a
// minimum listing count per category so empty/sparse ones stay out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/safety`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 }
  ];

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...staticRoutes, ...blogRoutes];
}
