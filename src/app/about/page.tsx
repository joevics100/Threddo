import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Threddo",
  description:
    "Threddo is a secondhand fashion marketplace for Nigeria — buy, sell, or give away clothes, shoes, bags, and more, with no fees and no in-app payments.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        About Threddo
      </h1>

      <div className="mt-6 space-y-6 text-black/70">
        <p>
          Threddo is a marketplace built for Nigeria, where anyone can give away or sell secondhand
          clothes, shoes, bags, accessories, and hair — directly to buyers nearby, with no fees and
          no in-app payments getting in the way.
        </p>

        <p>
          A lot of good, wearable clothing sits unused in wardrobes across the country while other
          people are actively looking for exactly that item at a fair price — or for free. Threddo
          exists to close that gap: a simple, WhatsApp-first way to connect sellers with buyers,
          without the friction of shipping, escrow accounts, or platform cuts.
        </p>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">How it works</h2>
          <ol className="mt-3 grid list-decimal gap-2 pl-5">
            <li>Post a listing with photos, a price (or mark it free), and your location.</li>
            <li>Interested buyers reach you directly on WhatsApp — no in-app chat required.</li>
            <li>You arrange the details and complete payment or handover directly, in person.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">What Threddo is not</h2>
          <p className="mt-2">
            Threddo doesn&apos;t hold your money, ship your items, or take a cut of any sale. Every
            transaction happens directly between buyer and seller. See our{" "}
            <Link href="/safety" className="font-semibold text-[#E8543D] hover:underline">
              Safety Guide
            </Link>{" "}
            for tips on trading safely, and our{" "}
            <Link href="/terms" className="font-semibold text-[#E8543D] hover:underline">
              Terms of Service
            </Link>{" "}
            for the full picture.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-[#1B1F3B] p-6 text-center text-white">
        <p className="font-medium">Have something to give away or sell?</p>
        <p className="mt-1 text-sm text-white/70">
          <Link href="/post" className="font-semibold text-[#E8A33D] hover:underline">
            Post your first listing
          </Link>{" "}
          — it only takes a couple of minutes.
        </p>
      </div>
    </main>
  );
}
