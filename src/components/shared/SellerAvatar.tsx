import Image from "next/image";

interface SellerAvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
}

export function SellerAvatar({ name, avatarUrl, size = 40 }: SellerAvatarProps) {
  const initials =
    (name ?? "T U")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TU";

  if (avatarUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full bg-[#1B1F3B]/10"
        style={{ width: size, height: size }}
      >
        <Image src={avatarUrl} alt={name ?? "Seller"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1B1F3B] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
