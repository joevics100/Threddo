import type { Metadata } from "next";

import { SignupForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign up"
};

export default function SignupPage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-black/60">
          It&apos;s free to join and post your first item.
        </p>

        <div className="mt-6">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
