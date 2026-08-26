import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { AdminCreateListingForm } from "@/features/trust-safety";

export const metadata: Metadata = {
  title: "Create listing for user",
  robots: { index: false, follow: false }
};

export default async function AdminCreateListingPage({
  searchParams
}: {
  searchParams: Promise<{ userId?: string; created?: string }>;
}) {
  const { userId, created } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: users }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").order("name"),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, whatsapp_number, is_banned")
      .order("full_name")
  ]);

  const initialSelectedUser = userId ? (users ?? []).find((u) => u.id === userId) || null : null;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[#1B1F3B]">Create listing for a user</h2>
        <p className="mt-1 text-sm text-black/60">
          For sellers who dropped off photos (e.g. over WhatsApp) and don&apos;t want to use the app
          themselves. The listing belongs to them from the moment it&apos;s created — it shows up in
          their dashboard and they can edit or delete it like any other listing, no sign-in or extra
          step needed on their end.
        </p>
      </div>

      {created ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-50 p-3 text-sm text-emerald-800">
          {Number(created) > 1 ? `${created} listings` : "Listing"} created and published — add more
          for the same person, or pick someone else.
        </p>
      ) : null}

      <AdminCreateListingForm
        categories={categories ?? []}
        users={users ?? []}
        initialSelectedUser={initialSelectedUser}
      />
    </div>
  );
}
