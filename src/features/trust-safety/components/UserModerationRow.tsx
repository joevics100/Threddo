"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { BadgeCheck } from "lucide-react";

import { timeAgo } from "@/lib/date";

import { SellerAvatar } from "@/components/shared";
import { Button } from "@/ui";
import { setUserBannedAction } from "@/features/trust-safety/actions/admin.actions";

export interface UserRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_banned: boolean;
  role: string;
  created_at: string;
  listing_count: number;
}

export function UserModerationRow({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleBan() {
    setError(null);
    startTransition(async () => {
      const result = await setUserBannedAction(user.id, !user.is_banned);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-black/5 bg-white p-4">
      <div className="flex items-center gap-3">
        <SellerAvatar name={user.full_name} avatarUrl={user.avatar_url} size={40} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1B1F3B]">{user.full_name ?? "Unnamed user"}</span>
            {user.is_verified ? <BadgeCheck className="size-4 text-[#E8A33D]" /> : null}
            {user.is_banned ? (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                Banned
              </span>
            ) : null}
          </div>
          <p className="text-xs text-black/50">
            {user.listing_count} listing{user.listing_count === 1 ? "" : "s"} · Joined{" "}
            {timeAgo(user.created_at)}
          </p>
          {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" size="sm" variant="outline" asChild>
          <Link href={`/sellers/${user.id}`} target="_blank">
            Seller page
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={user.is_banned ? "outline" : "destructive"}
          disabled={isPending || user.role === "admin"}
          onClick={handleToggleBan}
        >
          {user.is_banned ? "Unban" : "Ban"}
        </Button>
      </div>
    </div>
  );
}
