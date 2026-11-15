import Image from "next/image";
import Link from "next/link";

import { marketplaceHref } from "@/lib/marketplace";

const LINK_CLASS = "text-white/70 hover:text-white hover:underline";

export function Footer() {
  return (
    <footer className="bg-[#1B1F3B] py-10">
      <div className="container mx-auto flex flex-col items-center gap-3 px-6 text-center text-sm text-white/60">
        <Image src="/logo-light.png" alt="Threddo" width={35} height={40} />
        <p>© {new Date().getFullYear()} Threddo. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/about" className={LINK_CLASS}>
            About
          </Link>
          <Link href="/blog" className={LINK_CLASS}>
            Blog
          </Link>
          <Link href="/contact" className={LINK_CLASS}>
            Contact
          </Link>
          <Link href="/privacy" className={LINK_CLASS}>
            Privacy
          </Link>
          <Link href="/terms" className={LINK_CLASS}>
            Terms
          </Link>
          <a href={marketplaceHref("/")} className={LINK_CLASS}>
            Threddo Marketplace
          </a>
        </div>
      </div>
    </footer>
  );
}
