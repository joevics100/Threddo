import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Log in"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-black/60">Log in to post and manage your listings.</p>

        <div className="mt-6">
          <LoginForm redirectTo={next} />
        </div>
      </div>
    </main>
  );
}
