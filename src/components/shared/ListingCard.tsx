import Image from "next/image";
import Link from "next/link";

import type { ListingCondition } from "@/types/database.types";

import { formatNaira, getConditionLabel } from "@/features/listings/lib/format";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number | null;
  isFree: boolean;
  condition: ListingCondition;
  state: string | null;
  lga: string | null;
  imageUrl?: string;
}

export function ListingCard({
  id,
  title,
  price,
  isFree,
  condition,
  state,
  lga,
  imageUrl
}: ListingCardProps) {
  const location = [lga, state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/listings/${id}`}
      className="group overflow-hidden rounded-xl border border-[#1B1F3B]/10 bg-[#FBF8F3] transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-[#1B1F3B]/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#1B1F3B]/40">
            No photo
          </div>
        )}
      </div>
      <div className="p-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
            isFree ? "bg-[#1B1F3B]/10 text-[#1B1F3B]" : "bg-[#E8543D]/10 text-[#E8543D]"
          }`}
        >
          {isFree ? "Free" : "For sale"}
        </span>
        <h3 className="mt-2 truncate text-sm font-semibold text-[#1B1F3B]">{title}</h3>
        <p className="mt-1 text-sm font-bold text-[#1B1F3B]">
          {formatNaira(isFree ? null : price)}
        </p>
        <p className="mt-1 truncate text-xs text-[#1B1F3B]/55">
          {getConditionLabel(condition)}
          {location ? ` · ${location}` : ""}
        </p>
      </div>
    </Link>
  );
}
