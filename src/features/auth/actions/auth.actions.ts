"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput
} from "@/features/auth/schemas/auth.schemas";

export interface AuthActionResult {
  error?: string;
}

export async function signUpAction(values: SignupInput): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled in Supabase, there's no session yet —
  // send the user to a "check your inbox" screen instead of the dashboard.
  if (!data.session) {
    redirect("/signup/check-email");
  }

  redirect("/dashboard");
}

export async function signInAction(
  values: LoginInput,
  redirectTo?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please confirm your email address before logging in." };
    }
    return { error: "Incorrect email or password." };
  }

  // Only ever redirect to a same-site path — never follow an absolute/external
  // URL from a query param.
  const safeRedirect = redirectTo?.startsWith("/") ? redirectTo : "/dashboard";
  redirect(safeRedirect);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
