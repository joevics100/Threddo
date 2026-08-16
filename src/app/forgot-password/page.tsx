import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: true }
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
