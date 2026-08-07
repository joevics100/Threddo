import type { Metadata } from "next";

import { siteConfig } from "@/config/site.config";

import { Separator } from "@/ui";
import { AuthTabs, GoogleSignInButton, SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: true }
};

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <AuthTabs active="signup" next={next} />

        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-black/60">
          It&apos;s free to join and post your first item.
        </p>

        {siteConfig.googleSignInEnabled ? (
          <>
            <div className="mt-6">
              <GoogleSignInButton />
            </div>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-black/40 uppercase">or</span>
              <Separator className="flex-1" />
            </div>

            <SignupForm />
          </>
        ) : (
          <div className="mt-6">
            <SignupForm />
          </div>
        )}
      </div>
    </main>
  );
}
