import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { BulkListingForm } from "@/features/listings";

export const metadata: Metadata = {
  title: "List several items at once",
  robots: { index: false, follow: false }
};

export default async function BulkPostPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/post/bulk");
  }

  const [{ data: categories }, { data: profile }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    supabase.from("profiles").select("whatsapp_number").eq("id", user.id).single()
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
        List several items at once
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Got a pile of old clothes? Add a photo per item and AI will suggest the details — review,
        adjust anything that&apos;s off, and post them all together.
      </p>

      <div className="mt-8">
        <BulkListingForm
          categories={categories ?? []}
          defaultWhatsappNumber={profile?.whatsapp_number ?? ""}
        />
      </div>
    </main>
  );
}
