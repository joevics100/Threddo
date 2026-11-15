import type { Metadata } from "next";

import { marketplaceHref } from "@/lib/marketplace";

import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; banned?: string }>;
}) {
  const { next, banned } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Admin login
        </h1>
        <p className="mt-1 text-sm text-black/60">For the Threddo team to manage the blog.</p>

        {banned === "1" ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This account has been suspended.
          </p>
        ) : null}

        <div className="mt-6">
          <LoginForm redirectTo={next} />
        </div>

        <p className="mt-6 text-center text-sm text-black/60">
          Looking to buy or sell?{" "}
          <a href={marketplaceHref("/login")} className="font-medium text-[#1B1F3B] underline">
            Log in to the marketplace
          </a>
        </p>
      </div>
    </main>
  );
}
