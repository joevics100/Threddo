import type { NextConfig } from "next";

import bundleAnalyzer from "@next/bundle-analyzer";
import type { RuleSetRule } from "webpack";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

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
    ]
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
