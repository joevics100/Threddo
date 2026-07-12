import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety Guide"
};

const GUIDELINES = [
  {
    title: "Meet in a public place",
    body: "Choose somewhere busy and well-lit — a mall entrance, a bank, a police station car park. Avoid meeting at someone's house or an isolated address, especially for a first trade."
  },
  {
    title: "Inspect before you pay",
    body: "See the item in person, check it matches the photos and description, and try it on or test it if that's relevant, before any money changes hands."
  },
  {
    title: "Never pay upfront to a stranger",
    body: "Be wary of anyone asking for full or partial payment before you've met or seen the item — especially via bank transfer to an account name that doesn't match the seller's."
  },
  {
    title: "Bring a friend when you can",
    body: "For higher-value items, or if anything about the deal feels off, bring someone with you or let a friend know where you're going and who you're meeting."
  },
  {
    title: "Use Escrow for extra peace of mind",
    body: "On any listing, the \u201cUse Escrow\u201d button walks you through trading with a neutral moderator holding payment until you've confirmed the item is as described."
  },
  {
    title: "Check seller reviews",
    body: "Look at a seller's rating and past reviews on their listings before committing to a deal — and leave your own honest review afterward to help the next buyer."
  },
  {
    title: "Trust your instincts",
    body: "If a price feels too good to be true, a seller is pressuring you to act fast, or something just feels wrong, it's okay to walk away."
  },
  {
    title: "Report anything suspicious",
    body: "Use the \u201cReport listing\u201d button on any listing that looks like a scam, is miscategorized, or breaks these guidelines. Our admin team reviews every report."
  }
];

export default function SafetyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Safety Guide</h1>
      <p className="mt-2 text-black/60">
        Threddo connects you directly with buyers and sellers — there&apos;s no in-app payment
        holding your money safe by default, so a bit of common sense goes a long way. Here&apos;s
        how to trade safely.
      </p>

      <div className="mt-8 grid gap-6">
        {GUIDELINES.map((item, index) => (
          <div
            key={item.title}
            className="flex gap-4 rounded-2xl border border-black/5 bg-white p-5"
          >
            <span className="text-2xl font-[var(--font-display)] font-bold text-[#E8A33D]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-semibold text-[#1B1F3B]">{item.title}</h2>
              <p className="mt-1 text-sm text-black/70">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-[#1B1F3B] p-6 text-center text-white">
        <p className="font-medium">Seen a listing that doesn&apos;t feel right?</p>
        <p className="mt-1 text-sm text-white/70">
          Report it directly from the listing page, or browse safely rated sellers on{" "}
          <Link href="/listings" className="font-semibold text-[#E8A33D] hover:underline">
            our listings page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
