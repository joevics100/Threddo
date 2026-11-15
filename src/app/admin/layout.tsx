import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/blog");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Admin</h1>

      <nav className="mt-4 flex gap-4 border-b border-black/10 pb-3">
        <Link href="/admin/blog" className="text-sm font-medium text-[#1B1F3B] hover:underline">
          Blog posts
        </Link>
        <Link href="/admin/blog/new" className="text-sm font-medium text-[#1B1F3B] hover:underline">
          New post
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </main>
  );
}
