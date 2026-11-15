import { env } from "@/env";

/**
 * The marketplace (listings, sign-up, posting, dashboards) is its own site on
 * a subdomain. This site only links to it — never reimplements it — so every
 * outbound link is built here from a single env var. Defaults to the planned
 * subdomain so local dev and previews still produce sensible links.
 */
export const MARKETPLACE_URL = (
  env.NEXT_PUBLIC_MARKETPLACE_URL ?? "https://shop.threddo.com.ng"
).replace(/\/$/, "");

/** Absolute URL into the marketplace, e.g. marketplaceHref("/listings?category=shoes"). */
export function marketplaceHref(path = "/"): string {
  return `${MARKETPLACE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
