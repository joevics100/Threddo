import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { ThemeSwitcher } from "@/components/shared";
import { Button } from "@/ui";
import { signOutAction } from "@/features/auth";

export const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Threddo
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/listings"
            className="hidden text-sm font-medium text-[#1B1F3B]/70 hover:text-[#1B1F3B] sm:inline"
          >
            Browse
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-[#1B1F3B]/70 hover:text-[#1B1F3B] sm:inline"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[#1B1F3B]/70 hover:text-[#1B1F3B] sm:inline"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}

          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
};
