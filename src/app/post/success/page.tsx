import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Listing submitted"
};

export default function PostSuccessPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Listing submitted!
        </h1>
        <p className="mt-3 text-sm text-black/60">
          Thanks — we&apos;ll review your listing and it&apos;ll go live once approved, usually
          within a day.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#E8A33D] px-5 py-2.5 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
          >
            Go to dashboard
          </Link>
          <Link
            href="/post"
            className="rounded-lg border border-black/10 px-5 py-2.5 text-sm font-semibold text-[#1B1F3B] transition hover:bg-black/5"
          >
            Post another
          </Link>
        </div>
      </div>
    </main>
  );
}
