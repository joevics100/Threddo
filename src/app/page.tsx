import Link from "next/link";

import { CategoryCard } from "@/components/shared/CategoryCard";
import { ListingCard } from "@/components/shared/ListingCard";

const CATEGORIES = [
  { name: "Clothes", slug: "clothes", count: "Gowns, Ankara, jeans & more" },
  { name: "Shoes", slug: "shoes", count: "Sneakers, heels, native shoes" },
  { name: "Bags", slug: "bags", count: "Totes, backpacks, clutches" },
  { name: "Accessories", slug: "accessories", count: "Jewelry, watches, gele" },
  { name: "Hair", slug: "hair", count: "Wigs, weaves, extensions" },
  { name: "Others", slug: "others", count: "Everything else" }
];

// Placeholder data — replace with Supabase query once listings table is live
const SAMPLE_LISTINGS = [
  {
    id: "1",
    title: "Ankara Wrap Dress, Size M",
    price: "Free",
    location: "Ikeja, Lagos",
    condition: "Fairly used",
    type: "donation" as const
  },
  {
    id: "2",
    title: "Nike Air Force 1, Size 42",
    price: "₦15,000",
    location: "Wuse, Abuja",
    condition: "Like new",
    type: "sale" as const
  },
  {
    id: "3",
    title: "Human Hair Bob Wig",
    price: "₦25,000",
    location: "GRA, Enugu",
    condition: "New",
    type: "sale" as const
  },
  {
    id: "4",
    title: "Kids' Winter Jacket, Age 6-7",
    price: "Free",
    location: "Sabon Gari, Kano",
    condition: "Fairly used",
    type: "donation" as const
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B1F3B] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E8A33D] opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#E8543D] opacity-10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 py-24 md:py-32">
          <span className="mb-5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium tracking-widest text-[#E8A33D] uppercase">
            Made for Nigeria
          </span>
          <h1 className="max-w-2xl text-5xl leading-[1.05] font-[var(--font-display)] font-bold tracking-tight md:text-7xl">
            Give it away.
            <br />
            Or sell it fast.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">
            Threddo connects your wardrobe to someone who needs it — clothes, shoes, bags, and hair,
            posted in minutes and picked up over WhatsApp. No fees. No middleman. No hassle.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/listings"
              className="rounded-lg bg-[#E8A33D] px-7 py-3.5 font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Browse listings
            </Link>
            <Link
              href="/post"
              className="rounded-lg border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Post an item — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          What are you looking for?
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {/* Recent listings */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
              Fresh on Threddo
            </h2>
            <Link href="/listings" className="text-sm font-semibold text-[#E8543D] hover:underline">
              See all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_LISTINGS.map((item) => (
              <ListingCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbering earns its place */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          How Threddo works
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Post your item",
              body: "Snap a few photos, set your price (or mark it free), and choose your state and town."
            },
            {
              step: "02",
              title: "Get contacted directly",
              body: "Interested buyers reach you straight on WhatsApp or by phone — no waiting on site messages."
            },
            {
              step: "03",
              title: "Meet and hand over",
              body: "Agree on a safe public spot nearby. Need extra trust? Use our simple WhatsApp escrow."
            }
          ].map((s) => (
            <div key={s.step}>
              <span className="text-4xl font-[var(--font-display)] font-bold text-[#E8A33D]">
                {s.step}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-[#1B1F3B]">{s.title}</h3>
              <p className="mt-2 text-[#1B1F3B]/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety banner */}
      <section className="bg-[#1B1F3B] py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-2xl font-[var(--font-display)] font-bold text-white">
            Stay safe while you trade
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Always meet in a public place, inspect items before paying, and never send money upfront
            to a stranger. If a deal feels off, trust that feeling.
          </p>
          <Link
            href="/safety"
            className="mt-5 inline-block text-sm font-semibold text-[#E8A33D] hover:underline"
          >
            Read our full safety guide →
          </Link>
        </div>
      </section>
    </main>
  );
}
