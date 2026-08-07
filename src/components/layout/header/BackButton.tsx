"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ArrowLeft } from "lucide-react";

/**
 * Maps a pathname to its logical parent in the site's structure — e.g. a
 * listing detail page's parent is always /listings, regardless of whether
 * the visitor arrived there from the homepage, a search, or a direct link.
 * This is deliberately NOT router.back(): browser history depends on how
 * the visitor got here, which is often not the "up one level" page a back
 * arrow implies.
 *
 * Ordered most-specific first; the first match wins.
 */
const ROUTE_PARENTS: { test: RegExp; parent: (path: string) => string }[] = [
  { test: /^\/listings\/[^/]+\/edit$/, parent: (p) => p.replace(/\/edit$/, "") },
  { test: /^\/listings\/filters$/, parent: () => "/listings" },
  { test: /^\/listings\/[^/]+$/, parent: () => "/listings" },
  { test: /^\/listings$/, parent: () => "/" },
  { test: /^\/dashboard\/listings$/, parent: () => "/dashboard" },
  { test: /^\/dashboard$/, parent: () => "/" },
  { test: /^\/admin\/blog\/[^/]+\/edit$/, parent: () => "/admin/blog" },
  { test: /^\/admin\/blog\/new$/, parent: () => "/admin/blog" },
  { test: /^\/admin\/blog$/, parent: () => "/admin" },
  { test: /^\/admin\/listings$/, parent: () => "/admin" },
  { test: /^\/admin\/reports$/, parent: () => "/admin" },
  { test: /^\/admin$/, parent: () => "/" },
  { test: /^\/blog\/[^/]+$/, parent: () => "/blog" },
  { test: /^\/blog$/, parent: () => "/" },
  { test: /^\/signup\/check-email$/, parent: () => "/signup" },
  { test: /^\/signup$/, parent: () => "/" },
  { test: /^\/onboarding\/phone$/, parent: () => "/signup" },
  { test: /^\/post\/success$/, parent: () => "/" },
  { test: /^\/post$/, parent: () => "/" },
  { test: /^\/settings$/, parent: () => "/dashboard" },
  { test: /^\/sellers\/[^/]+$/, parent: () => "/" },
  { test: /^\/saved$/, parent: () => "/" },
  { test: /^\/login$/, parent: () => "/" },
  { test: /^\/(about|privacy|safety|terms)$/, parent: () => "/" }
];

function getParentPath(pathname: string): string | null {
  if (pathname === "/") return null;
  for (const rule of ROUTE_PARENTS) {
    if (rule.test.test(pathname)) return rule.parent(pathname);
  }
  // Fallback for any route not explicitly mapped: go up one URL segment.
  const segments = pathname.split("/").filter(Boolean);
  segments.pop();
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

export function BackButton() {
  const pathname = usePathname();
  const parent = getParentPath(pathname);

  if (!parent) return null;

  return (
    <Link
      href={parent}
      aria-label="Back"
      className="flex items-center justify-center rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );
}
