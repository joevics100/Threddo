import type { Metadata } from "next";
import Link from "next/link";

import { marketplaceHref } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you read and use the Threddo blog.",
  alternates: { canonical: "/terms" }
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Using this site",
    body: "By reading or using threddo.com.ng you agree to these terms. If you don't agree, please don't use the site. You must use it lawfully and must not try to disrupt it, gain unauthorised access to it, or scrape it in a way that harms its performance."
  },
  {
    title: "Information only — not professional advice",
    body: "Our articles are general information and opinion, written to be helpful. They are not financial, legal, medical, or other professional advice, and they don't take your personal circumstances into account. Talk to a qualified professional before making decisions that matter, and use your own judgement."
  },
  {
    title: "Accuracy",
    body: "We work to keep articles accurate, but prices, markets, laws, and products change quickly and we can't guarantee that everything is complete or current. If you find an error, please tell us so we can correct it."
  },
  {
    title: "Our content",
    body: "The articles, design, and branding on this site belong to Threddo or its licensors. You're welcome to link to our pages and to quote short excerpts with clear credit and a link back. Please don't copy, republish, or sell our content, in whole or in large part, without our written permission."
  },
  {
    title: "Advertising and external links",
    body: "This site shows third-party advertising, and our articles may link to other websites. We don't control or endorse third-party ads or sites, and we aren't responsible for their content, products, or practices."
  },
  {
    title: "No warranties",
    body: 'The site and its content are provided "as is" and "as available", without warranties of any kind, to the fullest extent the law allows. We don\'t promise the site will always be available or free of errors.'
  },
  {
    title: "Limitation of liability",
    body: "To the fullest extent the law allows, Threddo is not liable for any loss or damage arising from your use of, or reliance on, this site or its content. Nothing in these terms limits liability that cannot be limited by law."
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of the Federal Republic of Nigeria."
  },
  {
    title: "Changes",
    body: "We may update these terms from time to time. The latest version is always on this page, and continuing to use the site after a change means you accept the updated terms."
  }
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Terms of Use</h1>
      <p className="mt-2 text-sm text-black/50">Last updated: 14 November 2026</p>

      <div className="mt-6 space-y-6 text-black/70">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-[#1B1F3B]">{section.title}</h2>
            <p className="mt-3">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">The Threddo marketplace</h2>
          <p className="mt-3">
            The{" "}
            <a href={marketplaceHref("/")} className="font-medium text-[#1B1F3B] underline">
              Threddo marketplace
            </a>{" "}
            is a separate site with its own accounts and its own terms. These terms cover only this
            blog.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B1F3B]">Contact</h2>
          <p className="mt-3">
            Questions about these terms? Reach us through our{" "}
            <Link href="/contact" className="font-medium text-[#1B1F3B] underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
