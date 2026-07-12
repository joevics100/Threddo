"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { profileSchema, type ProfileInput } from "@/features/account/schemas/account.schemas";

export interface UpdateProfileResult {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(values: ProfileInput): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      whatsapp_number: parsed.data.phone
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
