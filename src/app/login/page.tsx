import type { Metadata } from "next";

import { Separator } from "@/ui";
import { GoogleSignInButton, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: true }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-black/60">Log in to post and manage your listings.</p>

        {error === "oauth" ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Something went wrong signing in with Google. Please try again.
          </p>
        ) : null}

        <div className="mt-6">
          <GoogleSignInButton redirectTo={next} />
        </div>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-black/40 uppercase">or</span>
          <Separator className="flex-1" />
        </div>

        <LoginForm redirectTo={next} />
      </div>
    </main>
  );
}
