interface ListingCardProps {
  title: string;
  price: string;
  location: string;
  condition: string;
  type: "donation" | "sale";
}

export function ListingCard({ title, price, location, condition, type }: ListingCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[#1B1F3B]/10 bg-[#FBF8F3] transition hover:shadow-md">
      <div className="flex aspect-square items-center justify-center bg-[#1B1F3B]/5 text-xs text-[#1B1F3B]/40">
        Photo
      </div>
      <div className="p-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
            type === "donation"
              ? "bg-[#1B1F3B]/10 text-[#1B1F3B]"
              : "bg-[#E8543D]/10 text-[#E8543D]"
          }`}
        >
          {type === "donation" ? "Free" : "For sale"}
        </span>
        <h3 className="mt-2 truncate text-sm font-semibold text-[#1B1F3B]">{title}</h3>
        <p className="mt-1 text-sm font-bold text-[#1B1F3B]">{price}</p>
        <p className="mt-1 text-xs text-[#1B1F3B]/55">
          {condition} · {location}
        </p>
      </div>
    </div>
  );
}
