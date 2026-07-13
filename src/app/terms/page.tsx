import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service"
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-black/50">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-black/80">
        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">1. What Threddo is</h2>
          <p className="mt-2">
            Threddo is a classifieds platform that connects people who want to sell or give away
            used clothes, shoes, bags, and hair with people looking to buy or receive them. Threddo
            does not buy, sell, ship, or take payment for any item — every trade happens directly
            between the buyer and seller, typically over WhatsApp or phone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">2. Your account</h2>
          <p className="mt-2">
            You must provide accurate information when signing up, including a working phone number
            buyers can reach you on. You&apos;re responsible for anything posted from your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">3. Posting a listing</h2>
          <p className="mt-2">
            Listings must accurately describe the item, its condition, and its price. Every listing
            is reviewed before it goes live and may be rejected or removed if it&apos;s
            miscategorized, misleading, prohibited, or breaks these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">4. Trading safely</h2>
          <p className="mt-2">
            Threddo doesn&apos;t mediate payments or guarantee any transaction. Read our{" "}
            <a href="/safety" className="underline">
              Safety Guide
            </a>{" "}
            before meeting a buyer or seller, and use the in-app Escrow option if you&apos;d like a
            neutral third party involved.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">5. Prohibited items and conduct</h2>
          <p className="mt-2">
            Don&apos;t post counterfeit goods, stolen items, or anything illegal to sell. Don&apos;t
            harass, scam, or mislead other users. Reported listings and accounts are reviewed by our
            admin team, and we may remove content or suspend accounts that break these rules.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">6. Limitation of liability</h2>
          <p className="mt-2">
            Threddo is provided &ldquo;as is.&rdquo; We&apos;re not liable for the quality, safety,
            or legality of items listed, the accuracy of listings, or the conduct of buyers and
            sellers. Use your judgment and follow our safety guidance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">7. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms as Threddo grows. Continued use of the platform after a change
            means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">8. Contact</h2>
          <p className="mt-2">Questions about these terms? Reach out through your account email.</p>
        </section>
      </div>
    </main>
  );
}
