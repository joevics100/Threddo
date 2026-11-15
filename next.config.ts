import type { NextConfig } from "next";

import bundleAnalyzer from "@next/bundle-analyzer";
import type { RuleSetRule } from "webpack";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

// The marketplace moved to its own subdomain. Anything that used to live at
// these paths (old links, bookmarks, Google's index) is sent there with a
// permanent redirect, so existing listing URLs keep working and keep their
// search standing instead of turning into 404s on this site.
const MARKETPLACE_URL = (
  process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "https://shop.threddo.com.ng"
).replace(/\/$/, "");
const MARKETPLACE_PATHS = [
  "listings",
  "post",
  "sellers",
  "saved",
  "dashboard",
  "settings",
  "signup",
  "onboarding",
  "safety"
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      // Legacy Supabase Storage images — kept so photos uploaded before the
      // R2 migration keep rendering; safe to remove once none remain.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/**" },
      // Cloudflare R2's own r2.dev subdomain (used if no custom domain is set).
      { protocol: "https", hostname: "*.r2.dev" },
      // Whatever custom domain R2_PUBLIC_URL points to, e.g. images.threddo.com.ng.
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: new URL(process.env.R2_PUBLIC_URL).protocol.replace(":", "") as "https",
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname
            }
          ]
        : [])
    ],
    // Every listing and blog-cover photo is already compressed client-side
    // before upload (down to ~180KB, max 1600px — see
    // features/listings/lib/compress-image.ts), and every static asset in
    // /public is already a reasonable web size. Vercel's on-demand image
    // optimization was re-resizing/re-encoding images that didn't need it
    // and running the project over its Image Optimization quota. Turning it
    // off here means <Image> serves the original file directly — no
    // further transformation, no quota usage — relying entirely on the
    // client-side compression that already does this job.
    unoptimized: true
  },
  async redirects() {
    return MARKETPLACE_PATHS.map((path) => ({
      source: `/${path}/:rest*`,
      destination: `${MARKETPLACE_URL}/${path}/:rest*`,
      permanent: true
    }));
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: { typescript: true, icon: true, titleProp: true, svgo: true, prettier: false }
          }
        ],
        as: "*.js"
      }
    }
  },
  webpack(config) {
    const rules = config.module.rules as RuleSetRule[];
    const fileLoaderRule = rules.find(
      (rule): rule is RuleSetRule =>
        !!rule && typeof rule === "object" && rule.test instanceof RegExp && rule.test.test(".svg")
    );
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;
    config.module.rules.push({ test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ["@svgr/webpack"] });
    return config;
  }
};

export default withBundleAnalyzer(nextConfig);
