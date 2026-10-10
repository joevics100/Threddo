import { ChevronDown } from "lucide-react";

import { parseDetailSections } from "@/features/listings/lib/detail-sections";

interface ListingDetailSectionsProps {
  sections: unknown;
}

/**
 * Collapsible buyer-guide sections. Native <details> keeps the text in the
 * server-rendered HTML (crawlable) with zero client JS; only the first one
 * starts open.
 */
export function ListingDetailSections({ sections }: ListingDetailSectionsProps) {
  const items = parseDetailSections(sections);
  if (items.length === 0) return null;

  return (
    <div className="mt-6 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
      {items.map((section, index) => (
        <details key={section.title} open={index === 0} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-[#1B1F3B] [&::-webkit-details-marker]:hidden">
            <h2 className="text-base">{section.title}</h2>
            <ChevronDown className="size-4 shrink-0 text-black/40 transition group-open:rotate-180" />
          </summary>
          <p className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-line text-[#1B1F3B]/80">
            {section.body}
          </p>
        </details>
      ))}
    </div>
  );
}
