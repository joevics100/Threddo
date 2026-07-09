import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Middleware already guards this route, but a server component should never
  // trust that alone — re-check here in case middleware config ever changes.
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-2 text-black/60">{user.email}</p>
        </div>
        <Link
          href="/post"
          className="rounded-lg bg-[#E8A33D] px-5 py-2.5 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
        >
          Post an item
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <p className="text-sm text-black/60">
          Your listings will show up here once the browse pages are live (Phase 3). For now, this
          confirms you&apos;re logged in, this route is protected, and you can submit a listing for
          review.
        </p>
      </div>
    </main>
  );
}
