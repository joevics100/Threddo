import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  BadgeCheck,
  Bookmark,
  FileText,
  HelpCircle,
  LogOut,
  Package,
  ShieldCheck,
  Star,
  User as UserIcon
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { SellerAvatar, SettingsRow, SettingsSection } from "@/components/shared";
import { Button } from "@/ui";
import { ContactDialog } from "@/features/account";
import { signOutAction } from "@/features/auth";

export const metadata: Metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Middleware already guards this route, but a server component should never
  // trust that alone — re-check here in case middleware config ever changes.
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [
    { data: profile },
    { count: listingsCount },
    { count: pendingCount },
    { count: savedCount },
    { data: reviews }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, whatsapp_number, avatar_url, is_verified, created_at")
      .eq("id", user.id)
      .single(),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("saved_listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("reviews").select("rating").eq("seller_id", user.id)
  ]);

  const memberSinceYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;
  const reviewCount = reviews?.length ?? 0;
  const averageRating =
    reviewCount > 0 ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
  const contactNumber = profile?.whatsapp_number ?? profile?.phone ?? "";

  return (
    <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-2xl px-6 py-10 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#1B1F3B] to-[#2A3163] p-6 text-white">
        <SellerAvatar name={profile?.full_name ?? null} avatarUrl={profile?.avatar_url} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-xl font-[var(--font-display)] font-bold">
              {profile?.full_name || "Threddo user"}
            </h1>
            {profile?.is_verified ? (
              <BadgeCheck
                className="size-5 shrink-0 fill-white text-[#1B1F3B]"
                aria-label="Verified"
              />
            ) : null}
          </div>
          <p className="truncate text-sm text-white/70">{user.email}</p>
          {memberSinceYear ? (
            <p className="mt-0.5 text-xs text-white/50">Member since {memberSinceYear}</p>
          ) : null}
        </div>
      </div>

      {/* Listings */}
      <SettingsSection title="Listings">
        <SettingsRow
          icon={Package}
          title="My Listings"
          subtitle={
            listingsCount
              ? `${listingsCount} listing${listingsCount === 1 ? "" : "s"}${pendingCount ? ` · ${pendingCount} pending` : ""}`
              : "Post your first item"
          }
          href="/dashboard/listings"
        />
        <SettingsRow
          icon={Bookmark}
          title="Saved Listings"
          subtitle={savedCount ? `${savedCount} saved` : "Nothing saved yet"}
          href="/saved"
        />
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account">
        <ContactDialog defaultFullName={profile?.full_name ?? ""} defaultPhone={contactNumber} />
        <SettingsRow icon={UserIcon} title="Email" subtitle={user.email} />
      </SettingsSection>

      {/* Reputation */}
      <SettingsSection title="Reputation">
        <SettingsRow
          icon={Star}
          title="Reviews & public profile"
          subtitle={
            averageRating
              ? `${averageRating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"
          }
          href={`/sellers/${user.id}`}
        />
      </SettingsSection>

      {/* Support */}
      <SettingsSection title="Support">
        <SettingsRow icon={ShieldCheck} title="Safety tips" href="/safety" />
        <SettingsRow icon={FileText} title="Privacy Policy" href="/privacy" />
        <SettingsRow icon={HelpCircle} title="Terms of Service" href="/terms" />
      </SettingsSection>

      <form action={signOutAction} className="mt-8">
        <Button
          type="submit"
          variant="outline"
          className="w-full justify-center gap-2 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </form>
    </main>
  );
}
