"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  reportSchema,
  type ReportInput
} from "@/features/trust-safety/schemas/trust-safety.schemas";

export interface ReportActionResult {
  error?: string;
  success?: boolean;
}

export async function createReportAction(values: ReportInput): Promise<ReportActionResult> {
  const parsed = reportSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Log in to report a listing." };
  }

  const { error } = await supabase.from("reports").insert({
    listing_id: parsed.data.listingId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details || null
  });

  if (error) {
    return { error: "Couldn't submit your report. Please try again." };
  }

  revalidatePath(`/listings/${parsed.data.listingId}`);
  return { success: true };
}
