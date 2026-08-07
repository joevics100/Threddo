"use client";

import Link from "next/link";

interface AuthTabsProps {
  active: "login" | "signup";
  /** Preserves ?next= when hopping between login and signup mid-flow. */
  next?: string;
}

export function AuthTabs({ active, next }: AuthTabsProps) {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#1B1F3B]/5 p-1">
      <Link
        href={`/login${query}`}
        className={`rounded-full py-2 text-center text-sm font-semibold transition ${
          active === "login"
            ? "bg-white text-[#1B1F3B] shadow-sm"
            : "text-[#1B1F3B]/50 hover:text-[#1B1F3B]"
        }`}
      >
        Log in
      </Link>
      <Link
        href={`/signup${query}`}
        className={`rounded-full py-2 text-center text-sm font-semibold transition ${
          active === "signup"
            ? "bg-white text-[#1B1F3B] shadow-sm"
            : "text-[#1B1F3B]/50 hover:text-[#1B1F3B]"
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}
