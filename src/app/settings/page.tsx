import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/ui";
import { SettingsForm } from "@/features/account";
import { signOutAction } from "@/features/auth";

export const metadata: Metadata = {
  title: "Settings"
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, whatsapp_number")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-lg px-6 py-12 pb-24 sm:pb-12">
      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Settings</h1>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <p className="text-sm text-black/50">Email</p>
        <p className="text-sm font-medium text-[#1B1F3B]">{user.email}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1B1F3B]">Profile</h2>
        <div className="mt-4">
          <SettingsForm
            defaultFullName={profile?.full_name ?? ""}
            defaultPhone={profile?.whatsapp_number ?? profile?.phone ?? ""}
          />
        </div>
      </div>

      <form action={signOutAction} className="mt-6">
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </main>
  );
}
