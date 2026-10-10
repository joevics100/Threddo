import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Contact Threddo",
  description:
    "Get in touch with the Threddo team on WhatsApp for help with your account, a listing, a report, or an escrow transaction.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Contact Threddo
      </h1>

      <div className="mt-6 space-y-6 text-black/70">
        <p>
          Have a question about your account, a listing, or something that didn&apos;t feel right?
          The Threddo team is here to help. The fastest way to reach us is on WhatsApp.
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
            <li>Problems with your account, login, or phone number.</li>
            <li>A listing that was rejected, or one you need removed or corrected.</li>
            <li>
              Reporting a seller, buyer, or listing you believe is a scam or breaks our rules.
            </li>
            <li>Starting an escrow transaction for a higher-value purchase.</li>
            <li>Deleting your account and the data attached to it.</li>
            <li>Feedback, partnerships, or press questions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Before you message</h2>
          <p className="mt-3">
            Tell us what happened and include the link to the listing or profile involved, so we can
            look into it quickly. To report a listing, you can also use the report button on the
            listing page. Read our{" "}
            <Link href="/safety" className="font-medium text-[#1B1F3B] underline">
              safety tips
            </Link>{" "}
            for how to buy and sell with confidence, and see our{" "}
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

        <p>We aim to reply within one to two working days.</p>
      </div>
    </main>
  );
}
