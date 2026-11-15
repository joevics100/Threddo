import type { Metadata } from "next";
import Link from "next/link";

import { marketplaceHref } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Threddo blog collects and uses information, including cookies, analytics, and Google advertising.",
  alternates: { canonical: "/privacy" }
};

const LINK = "font-medium text-[#1B1F3B] underline";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-black/50">Last updated: 14 November 2026</p>

      <div className="mt-6 space-y-6 text-black/70">
        <p>
          This policy explains what information the Threddo blog (threddo.com.ng) collects when you
          read it, how we use that information, and the choices you have. You don&apos;t need an
          account to read our articles, and we don&apos;t ask readers for personal details in order
          to do so.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Information we collect</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5">
            <li>
              <strong>Usage information.</strong> Like most websites, our servers and analytics
              tools receive technical data when you visit: your IP address, browser and device type,
              approximate location, the pages you view, and the page that referred you.
            </li>
            <li>
              <strong>Cookies and similar technologies.</strong> Small files stored on your device
              that help the site work, measure traffic, and serve advertising (see below).
            </li>
            <li>
              <strong>Messages you send us.</strong> If you contact us on WhatsApp, we receive your
              number and whatever you choose to tell us, and we use it only to respond.
            </li>
            <li>
              <strong>Team accounts.</strong> The small group of people who manage the blog sign in
              with an email address and password. This does not apply to readers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">How we use it</h2>
          <p className="mt-3">
            To run and secure the site, understand which articles are useful so we can write better
            ones, respond to messages, prevent abuse, and show advertising that helps fund the blog.
            We don&apos;t sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Advertising and Google</h2>
          <p className="mt-3">
            We use Google AdSense to show ads on this site. Third-party vendors, including Google,
            use cookies to serve ads based on a user&apos;s prior visits to this website or other
            websites. Google&apos;s use of advertising cookies enables it and its partners to serve
            ads to you based on your visit to this site and/or other sites on the Internet.
          </p>
          <p className="mt-3">
            You can opt out of personalised advertising by visiting{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              Google Ads Settings
            </a>
            . You can also opt out of some third-party vendors&apos; use of cookies for personalised
            advertising at{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              aboutads.info
            </a>
            . To learn how Google uses data from sites that use its services, see{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              How Google uses information from sites or apps that use our services
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Analytics</h2>
          <p className="mt-3">
            We use Google Analytics to understand how readers use the site, such as which pages are
            visited and for how long. It collects usage information through cookies. You can limit
            this with your browser settings or Google&apos;s{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              opt-out browser add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Managing cookies</h2>
          <p className="mt-3">
            Most browsers let you block or delete cookies in their settings. Blocking some cookies
            may affect how parts of the site work, but you can still read our articles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">
            Other sites, including our marketplace
          </h2>
          <p className="mt-3">
            Our articles link to other websites. We aren&apos;t responsible for their content or
            privacy practices. The{" "}
            <a href={marketplaceHref("/")} className={LINK}>
              Threddo marketplace
            </a>{" "}
            is a separate site with its own accounts and its own privacy policy, which applies
            there.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Keeping information safe</h2>
          <p className="mt-3">
            We use reasonable technical measures to protect the information we hold and keep it only
            as long as it&apos;s needed for the purposes above. No method of transmission or storage
            is completely secure, so we can&apos;t guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Your rights</h2>
          <p className="mt-3">
            Under Nigerian data protection law, including the Nigeria Data Protection Act 2023, you
            may ask us what personal data we hold about you, to correct it, to delete it, or to
            object to certain uses. To make a request, use the details on our{" "}
            <Link href="/contact" className={LINK}>
              contact page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Children</h2>
          <p className="mt-3">
            This site is not directed at children under 13, and we don&apos;t knowingly collect
            personal information from them. If you believe a child has given us information, contact
            us and we&apos;ll remove it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Changes to this policy</h2>
          <p className="mt-3">
            We may update this policy from time to time. The latest version is always on this page,
            with the date above. Continuing to use the site after a change means you accept the
            updated policy.
          </p>
        </section>
      </div>
    </main>
  );
}
