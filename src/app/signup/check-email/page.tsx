import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email"
};

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Check your email
        </h1>
        <p className="mt-3 text-sm text-black/60">
          We&apos;ve sent you a confirmation link. Click it to activate your account, then log in.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[#E8A33D] px-6 py-2.5 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
