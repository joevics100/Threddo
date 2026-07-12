import Link from "next/link";

import {
  Footprints,
  Gem,
  Package,
  Shirt,
  ShoppingBag,
  Sparkles,
  Watch,
  type LucideIcon
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  count: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  clothing: Shirt,
  shoes: Footprints,
  "bags-purses": ShoppingBag,
  jewellery: Gem,
  accessories: Watch,
  hair: Sparkles
};

export function CategoryCard({ name, slug, count }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[slug] ?? Package;

  return (
    <Link
      href={`/listings?category=${slug}`}
      className="group flex flex-col justify-between rounded-xl border border-[#1B1F3B]/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#E8A33D] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B1F3B]"
    >
      <Icon className="size-6 text-[#E8A33D]" strokeWidth={1.75} />
      <span className="mt-3 text-base font-semibold text-[#1B1F3B]">{name}</span>
      <span className="mt-1 text-xs text-[#1B1F3B]/55">{count}</span>
    </Link>
  );
}
