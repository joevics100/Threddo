import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PhoneOnboardingForm } from "@/features/account/components/PhoneOnboardingForm";

export const metadata: Metadata = {
  title: "One more step",
  robots: { index: false, follow: false }
};

interface PhoneOnboardingPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function PhoneOnboardingPage({ searchParams }: PhoneOnboardingPageProps) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : "/dashboard";

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNext)}`);
  }

  // Already has a number on file (e.g. revisited this URL, or somehow got
  // here another way) — nothing to do, send them on.
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .single();

  if (profile?.phone) {
    redirect(safeNext);
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#FBF8F3] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
          One more step
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Add a phone number so buyers can reach you about your listings.
        </p>

        <div className="mt-6">
          <PhoneOnboardingForm next={safeNext} />
        </div>
      </div>
    </main>
  );
}
