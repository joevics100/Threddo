import Image from "next/image";
import Link from "next/link";

import { marketplaceHref } from "@/lib/marketplace";

import { Button } from "@/ui";

import { BackButton } from "./BackButton";

export const Header = () => {
  return (
    <header className="bg-[#1B1F3B]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-light.png" alt="Threddo" width={32} height={36} priority />
          <span className="text-xl font-[var(--font-display)] font-bold text-white">Threddo</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/blog" className="text-sm font-medium text-white/70 hover:text-white">
            Blog
          </Link>
          <a
            href={marketplaceHref("/listings")}
            className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
          >
            Browse listings
          </a>
          <Button asChild size="sm" className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]">
            <a href={marketplaceHref("/post")}>Sell your items</a>
          </Button>

          <BackButton />
        </nav>
      </div>
    </header>
  );
};
