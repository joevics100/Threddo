import { createClient } from "@/lib/supabase/server";

import { UserModerationRow, type UserRow } from "@/features/trust-safety/components/UserModerationRow";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, is_verified, is_banned, role, created_at, listings:listings!listings_user_id_fkey(count)"
    )
    .order("created_at", { ascending: false });

  const rows: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    is_verified: p.is_verified,
    is_banned: p.is_banned,
    role: p.role,
    created_at: p.created_at,
    listing_count: p.listings?.[0]?.count ?? 0
  }));

  return (
    <div className="grid gap-3">
      {rows.length > 0 ? (
        rows.map((user) => <UserModerationRow key={user.id} user={user} />)
      ) : (
        <p className="text-sm text-black/50">No users yet.</p>
      )}
    </div>
  );
}
