import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { ResetPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false }
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Set a new password
        </h1>

        {user ? (
          <>
            <p className="mt-1 text-sm text-black/60">Choose a new password for your account.</p>
            <div className="mt-6">
              <ResetPasswordForm />
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-black/60">This reset link is invalid or has expired.</p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block text-sm font-medium text-[#E8543D] hover:underline"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
