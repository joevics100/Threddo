"use client";

import { useState } from "react";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing more we can do here.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full border border-[#1B1F3B]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#1B1F3B] transition hover:bg-black/5"
    >
      <Share2 className="size-3.5" />
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
