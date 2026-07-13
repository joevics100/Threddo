import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-black/50">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-black/80">
        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">What we collect</h2>
          <p className="mt-2">
            When you create an account, we collect your name, email address, and phone number. When
            you post a listing, we store the details you provide — photos, description, price,
            location, and the contact number you choose to show buyers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">How we use it</h2>
          <p className="mt-2">
            Your phone number is shown on your listings so buyers can reach you directly —
            that&apos;s the whole point of Threddo. We use your email to manage your account and
            send account-related notifications. We don&apos;t sell your data to advertisers or third
            parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Photos and listing content</h2>
          <p className="mt-2">
            Photos you upload are stored to display your listing and are publicly visible once a
            listing is approved. Don&apos;t upload photos of anyone who hasn&apos;t agreed to appear
            in them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Who can see what</h2>
          <p className="mt-2">
            Your name, listings, reviews, and the contact number on each listing are public to
            anyone browsing Threddo. Your email address is never shown publicly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Cookies and analytics</h2>
          <p className="mt-2">
            We use basic analytics to understand how people use Threddo and to keep you logged in
            between visits. We don&apos;t use tracking for third-party advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Your choices</h2>
          <p className="mt-2">
            You can update your name and phone number anytime from Settings, and delete individual
            listings you&apos;ve posted. To delete your account entirely, contact us through your
            account email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy as Threddo grows. We&apos;ll post the updated version here
            with a new date.
          </p>
        </section>
      </div>
    </main>
  );
}
