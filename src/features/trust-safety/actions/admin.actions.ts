"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { generateAndSaveListingSections } from "@/features/listings/lib/save-listing-sections";

export interface AdminActionResult {
  error?: string;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null, error: "Log in as an admin to do this." } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, userId: null, error: "You don't have permission to do this." } as const;
  }

  return { supabase, userId: user.id, error: null } as const;
}

export async function approveListingAction(listingId: string): Promise<AdminActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", listingId);

  if (error) return { error: "Couldn't approve this listing." };

  // Edited listings come back through approval, so regenerate the buyer-guide
  // sections from the latest details. Failure is silent — approval still stands.
  await generateAndSaveListingSections(supabase, listingId, { force: true });

  revalidatePath("/admin/listings");
  revalidatePath(`/listings/${listingId}`);
  return {};
}

export async function rejectListingAction(
  listingId: string,
  reason: string
): Promise<AdminActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejection_reason: reason || null })
    .eq("id", listingId);

  if (error) return { error: "Couldn't reject this listing." };

  revalidatePath("/admin/listings");
  revalidatePath(`/listings/${listingId}`);
  return {};
}

/**
 * Reassigns an existing listing (any status, admin's own or anyone else's)
 * to a different user. Used e.g. when an admin published something under
 * their own account and later wants the actual seller to own it. Doesn't
 * touch status — a transferred listing stays exactly as approved/pending/
 * rejected as it was; admins can already change status separately via
 * approve/reject.
 */
export async function transferListingAction(
  listingId: string,
  targetUserId: string
): Promise<AdminActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, is_banned")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile) return { error: "Couldn't find that user." };
  if (targetProfile.is_banned) {
    return { error: "This user is banned — can't transfer a listing to them." };
  }

  const { error } = await supabase
    .from("listings")
    .update({ user_id: targetUserId })
    .eq("id", listingId);

  if (error) return { error: "Couldn't transfer this listing." };

  revalidatePath("/admin/listings");
  revalidatePath(`/listings/${listingId}`);
  return {};
}

export async function resolveReportAction(reportId: string): Promise<AdminActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) return { error: "Couldn't resolve this report." };

  revalidatePath("/admin/reports");
  return {};
}

export async function setUserBannedAction(
  userId: string,
  banned: boolean
): Promise<AdminActionResult> {
  const { supabase, userId: adminId, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (userId === adminId) {
    return { error: "You can't ban your own account." };
  }

  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (target?.role === "admin") {
    return { error: "Admins can't be banned from here." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: banned, banned_at: banned ? new Date().toISOString() : null })
    .eq("id", userId);

  if (error) return { error: `Couldn't ${banned ? "ban" : "unban"} this user.` };

  revalidatePath("/admin/users");
  return {};
}

export interface BackfillSectionsResult {
  error?: string;
  processed?: number;
  remaining?: number;
}

/**
 * Generates buyer-guide sections for approved listings that don't have any
 * yet, a few at a time (each needs an AI call, so one request can't do them
 * all). The admin button calls this repeatedly until `remaining` hits 0.
 */
export async function backfillListingSectionsAction(): Promise<BackfillSectionsResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const BATCH = 3;

  const { data: missing } = await supabase
    .from("listings")
    .select("id")
    .eq("status", "approved")
    .is("detail_sections", null)
    .order("created_at", { ascending: false })
    .limit(BATCH);

  let processed = 0;
  for (const row of missing ?? []) {
    const ok = await generateAndSaveListingSections(supabase, row.id);
    if (ok) {
      processed += 1;
      revalidatePath(`/listings/${row.id}`);
    }
  }

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .is("detail_sections", null);

  // If nothing in this batch succeeded the AI is failing — report it instead
  // of letting the button spin forever on the same listings.
  if ((missing?.length ?? 0) > 0 && processed === 0) {
    return {
      error: "AI couldn't generate sections right now. Check the Gemini keys and retry.",
      remaining: count ?? 0
    };
  }

  return { processed, remaining: count ?? 0 };
}
