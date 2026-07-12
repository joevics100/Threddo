"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Heart, Home, ListFilter, Plus, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/listings", label: "Listings", icon: ListFilter },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

/**
 * Mobile-only bottom tab bar (hidden at the `sm` breakpoint and above, where
 * the header's nav links take over). Auth is enforced by middleware, not
 * here — tapping "Saved", "Settings", or the "+" button while logged out
 * just redirects to /login, same as typing the URL directly.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white sm:hidden">
      <div className="mx-auto flex max-w-md items-end justify-between px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <TabLink item={NAV_ITEMS[0]} active={pathname === "/"} />
        <TabLink item={NAV_ITEMS[1]} active={pathname.startsWith("/listings")} />

        <Link
          href="/post"
          aria-label="Post a listing"
          className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-[#E8A33D] text-[#1B1F3B] shadow-lg transition active:scale-95"
        >
          <Plus className="size-7" />
        </Link>

        <TabLink item={NAV_ITEMS[2]} active={pathname.startsWith("/saved")} />
        <TabLink item={NAV_ITEMS[3]} active={pathname.startsWith("/settings")} />
      </div>
    </nav>
  );
}

function TabLink({ item, active }: { item: (typeof NAV_ITEMS)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px]",
        active ? "font-semibold text-[#1B1F3B]" : "text-[#1B1F3B]/50"
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  );
}
