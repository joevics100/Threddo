import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site.config";

import { marketplaceHref } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Contact Threddo",
  description:
    "Get in touch with the Threddo team on WhatsApp — article corrections, questions, partnerships, press, and privacy requests.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Contact Threddo
      </h1>

      <div className="mt-6 space-y-6 text-black/70">
        <p>
          Questions, corrections, or ideas? The fastest way to reach the Threddo team is on
          WhatsApp.
        </p>

        <a
          href={siteConfig.supportWhatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-[#1B1F3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B1F3B]/90"
        >
          Message us on WhatsApp
        </a>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">What we can help with</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5">
            <li>A mistake or out-of-date detail in one of our articles.</li>
            <li>Topic suggestions and feedback on what you&apos;d like us to write about.</li>
            <li>Partnerships, advertising, and press enquiries.</li>
            <li>Privacy questions, including requests to see or delete your data.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Need help with the marketplace?</h2>
          <p className="mt-3">
            Account, listing, and report questions are handled on the marketplace site — please use
            the contact options there:{" "}
            <a href={marketplaceHref("/contact")} className="font-medium text-[#1B1F3B] underline">
              Threddo Marketplace support
            </a>
            .
          </p>
        </div>

        <p>
          We aim to reply within one to two working days. See also our{" "}
          <Link href="/privacy" className="font-medium text-[#1B1F3B] underline">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-medium text-[#1B1F3B] underline">
            terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
