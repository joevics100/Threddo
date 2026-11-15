import type { Metadata } from "next";
import Link from "next/link";

import { marketplaceHref } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "About Threddo",
  description:
    "Threddo is a Nigerian blog about thrift fashion, saving money, and getting more from what you own — plus a free marketplace to buy, sell, or give away secondhand clothes.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        About Threddo
      </h1>

      <div className="mt-6 space-y-6 text-black/70">
        <p>
          Threddo is a Nigerian blog about thrift fashion, spending smarter, and getting more out of
          what you already own. We write practical, plainly worded guides — how to shop okrika
          markets with confidence, how to price and sell things you no longer use, how to stretch a
          budget, and how to turn a small idea into a little extra income.
        </p>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">What you&apos;ll find here</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5">
            <li>Thrift and okrika buying guides, price checks, and market tips.</li>
            <li>Advice for selling, decluttering, and making money from items you own.</li>
            <li>Everyday money-saving ideas written for Nigerian realities.</li>
          </ul>
        </div>

        <p>
          Articles are written and edited by the Threddo team. We aim to keep them accurate and
          useful, and we update them when prices, markets, or rules change. If you spot a mistake or
          something out of date, please{" "}
          <Link href="/contact" className="font-medium text-[#1B1F3B] underline">
            tell us
          </Link>{" "}
          and we&apos;ll look into it.
        </p>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">The Threddo marketplace</h2>
          <p className="mt-3">
            Alongside the blog, Threddo runs a free marketplace where people across Nigeria give
            away or sell secondhand clothes, shoes, bags, accessories, and hair — directly to
            buyers, with no fees and no in-app payments. It lives on its own site:{" "}
            <a
              href={marketplaceHref("/")}
              className="font-medium text-[#E8543D] underline hover:no-underline"
            >
              browse the Threddo marketplace
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
