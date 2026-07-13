import Link from "next/link";

import { BadgeCheck, ChevronRight } from "lucide-react";

import { SellerAvatar } from "@/components/shared";

interface SellerCardProps {
  sellerId: string;
  name: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  memberSince?: string;
}

export function SellerCard({
  sellerId,
  name,
  avatarUrl,
  isVerified,
  memberSince
}: SellerCardProps) {
  const memberSinceYear = memberSince ? new Date(memberSince).getFullYear() : null;

  return (
    <Link
      href={`/sellers/${sellerId}`}
      className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4 transition hover:shadow-sm"
    >
      <SellerAvatar name={name} avatarUrl={avatarUrl} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-[#1B1F3B]">{name ?? "Threddo user"}</span>
          {isVerified ? <BadgeCheck className="size-4 shrink-0 fill-[#1B1F3B] text-white" /> : null}
        </div>
        {memberSinceYear ? (
          <p className="text-xs text-black/50">Member since {memberSinceYear}</p>
        ) : null}
      </div>

      <ChevronRight className="size-4 shrink-0 text-black/30" />
    </Link>
  );
}
