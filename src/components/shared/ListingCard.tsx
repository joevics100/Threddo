"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ChevronLeft, ChevronRight, Gift, MapPin, Tag } from "lucide-react";

import type { ListingCondition } from "@/types/database.types";

import { SaveButton } from "@/features/listings/components/SaveButton";
import { formatNaira, getConditionLabel } from "@/features/listings/lib/format";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number | null;
  isFree: boolean;
  condition: ListingCondition;
  state: string | null;
  lga: string | null;
  /** All photos for this listing — the card lets the viewer swipe through them. */
  images?: string[];
  /** Only pass this when the viewer is logged in — omit to hide the save button entirely. */
  isSaved?: boolean;
}

export function ListingCard({
  id,
  title,
  price,
  isFree,
  condition,
  state,
  lga,
  images = [],
  isSaved
}: ListingCardProps) {
  const location = [lga, state].filter(Boolean).join(", ");
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActiveIndex(index);
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#1B1F3B]/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square bg-[#1B1F3B]/5">
        {images.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((url, index) => (
                <Link
                  key={url}
                  href={`/listings/${id}`}
                  className="relative h-full w-full shrink-0 snap-center"
                >
                  <Image
                    src={url}
                    alt={`${title} — photo ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    priority={index === 0}
                  />
                </Link>
              ))}
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                  aria-label="Previous photo"
                  className={`absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 ${
                    activeIndex === 0 ? "pointer-events-none opacity-0" : ""
                  }`}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToIndex(Math.min(images.length - 1, activeIndex + 1))}
                  aria-label="Next photo"
                  className={`absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 ${
                    activeIndex === images.length - 1 ? "pointer-events-none opacity-0" : ""
                  }`}
                >
                  <ChevronRight className="size-4" />
                </button>

                <div className="absolute right-0 bottom-2 left-0 flex justify-center gap-1">
                  {images.map((url, index) => (
                    <span
                      key={url}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <Link
            href={`/listings/${id}`}
            className="flex h-full items-center justify-center text-xs text-[#1B1F3B]/40"
          >
            No photo
          </Link>
        )}

        <span
          className={`absolute top-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur ${
            isFree ? "bg-emerald-500/90 text-white" : "bg-white/90 text-[#E8543D]"
          }`}
        >
          {isFree ? <Gift className="size-3" /> : <Tag className="size-3" />}
          {isFree ? "Donation" : "For sale"}
        </span>

        {isSaved !== undefined ? (
          <div className="absolute top-2 right-2">
            <SaveButton listingId={id} initialSaved={isSaved} />
          </div>
        ) : null}
      </div>

      <Link href={`/listings/${id}`} className="block p-4">
        <h3 className="truncate text-sm font-semibold text-[#1B1F3B]">{title}</h3>
        <p className="mt-1 text-base font-bold text-[#1B1F3B]">
          {formatNaira(isFree ? null : price)}
        </p>
        <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-[#1B1F3B]/55">
          {getConditionLabel(condition)}
          {location ? (
            <>
              <span className="text-[#1B1F3B]/25">·</span>
              <MapPin className="size-3 shrink-0" />
              {location}
            </>
          ) : null}
        </p>
      </Link>
    </div>
  );
}
