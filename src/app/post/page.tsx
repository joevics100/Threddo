import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PostListingForm } from "@/features/listings";

export const metadata: Metadata = {
  title: "Post a listing"
};

export default async function PostListingPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Middleware already guards this route — re-check here in case that config
  // ever changes, same pattern as /dashboard.
  if (!user) {
    redirect("/login?next=/post");
  }

  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").order("name"),
    supabase.from("profiles").select("whatsapp_number, phone").eq("id", user.id).single()
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        Post a listing
      </h1>
      <p className="mt-1 text-black/60">
        Listings are reviewed before they go live — usually within a day.
      </p>

      <div className="mt-8">
        <PostListingForm
          userId={user.id}
          categories={categories ?? []}
          defaultWhatsappNumber={profile?.whatsapp_number ?? profile?.phone ?? ""}
        />
      </div>
    </main>
  );
}
