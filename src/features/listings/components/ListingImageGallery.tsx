"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { X } from "lucide-react";

interface ListingImageGalleryProps {
  images: string[];
  title: string;
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-[#1B1F3B]/5 text-sm text-[#1B1F3B]/40">
        No photos
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setLightboxOpen(true);
              }}
              className="relative aspect-square w-full shrink-0 snap-center bg-[#1B1F3B]/5"
            >
              <Image
                src={url}
                alt={`${title} — photo ${index + 1}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </button>
          ))}
        </div>

        {images.length > 1 ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <button
            type="button"
            onClick={() => {
              setLightboxOpen(false);
              setZoomed(false);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white"
          >
            <X className="size-5" />
          </button>

          <div className="flex flex-1 snap-x snap-mandatory overflow-x-auto">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative flex w-full shrink-0 snap-center items-center justify-center overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  className="relative h-full w-full"
                >
                  <Image
                    src={url}
                    alt={`${title} — photo ${index + 1}`}
                    fill
                    sizes="100vw"
                    className={`object-contain transition-transform duration-200 ${
                      zoomed && index === activeIndex ? "scale-150" : "scale-100"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {images.length > 1 ? (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length} · tap photo to zoom
            </span>
          ) : (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              Tap photo to zoom
            </span>
          )}
        </div>
      ) : null}
    </>
  );
}
