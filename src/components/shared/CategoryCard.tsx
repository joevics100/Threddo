import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  count: string;
}

export function CategoryCard({ name, slug, count }: CategoryCardProps) {
  return (
    <Link
      href={`/listings?category=${slug}`}
      className="group flex flex-col justify-between rounded-xl border border-[#1B1F3B]/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#E8A33D] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B1F3B]"
    >
      <span className="text-base font-semibold text-[#1B1F3B]">{name}</span>
      <span className="mt-2 text-xs text-[#1B1F3B]/55">{count}</span>
    </Link>
  );
}
