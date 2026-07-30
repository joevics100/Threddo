import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { breadcrumbJsonLd, JsonLd, type BreadcrumbItem } from "@/lib/seo";

/** Home is implicit — always the first crumb — so callers only pass what comes after it. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems: BreadcrumbItem[] = [{ name: "Home", href: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(allItems)} />
      <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto">
        <ol className="flex items-center gap-1.5 text-sm whitespace-nowrap text-black/50">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <ChevronRight className="size-3.5 shrink-0" /> : null}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition hover:text-[#1B1F3B] hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-[#1B1F3B]" : ""}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
