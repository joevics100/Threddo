import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/ui";

export const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="bg-[#1B1F3B]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-[var(--font-display)] font-bold text-white">
          Threddo
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/listings"
            className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/post"
                className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
              >
                Post an item
              </Link>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
              >
                Profile
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/listings"
                  className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
                >
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]">
                <Link href="/signup">Sign up / Sign in</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
