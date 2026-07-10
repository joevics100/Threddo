"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface AdminActionResult {
  error?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Log in as an admin to do this." } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, error: "You don't have permission to do this." } as const;
  }

  return { supabase, error: null } as const;
}

export async function approveListingAction(listingId: string): Promise<AdminActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("listings")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", listingId);

  if (error) return { error: "Couldn't approve this listing." };

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
