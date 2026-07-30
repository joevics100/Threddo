import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Truly private, auth-gated screens with zero SEO value — no reason to
        // spend crawl budget here. Other non-indexable pages (login, post, etc.)
        // are handled with a per-page `noindex` instead of blocking the crawl,
        // so Google can see the tag and fully drop them rather than leaving a
        // "blocked by robots.txt" ghost entry in search results.
        disallow: ["/admin", "/dashboard"]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
