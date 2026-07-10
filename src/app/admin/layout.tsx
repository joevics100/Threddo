import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/listings");
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
        <Link href="/admin/listings" className="text-sm font-medium text-[#1B1F3B] hover:underline">
          Approval queue
        </Link>
        <Link href="/admin/reports" className="text-sm font-medium text-[#1B1F3B] hover:underline">
          Reports
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </main>
  );
}
