"use server";

import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site.config";

import { createClient } from "@/lib/supabase/server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
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

/**
 * Sends the reset email via Supabase Auth's built-in flow (its default
 * sender, until Resend is wired up) — the link routes through /auth/callback
 * (same PKCE exchange used for Google sign-in) and lands on /reset-password
 * with a recovery session already active.
 */
export async function requestPasswordResetAction(
  values: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/callback?next=${encodeURIComponent("/reset-password")}`
  });

  // Never reveal whether an account exists for this email — always report
  // success either way, same as most password-reset flows.
  if (error) {
    console.error("Password reset request failed:", error);
  }

  return {};
}

export interface ResetPasswordResult {
  error?: string;
}

/** Sets a new password — only works with an active recovery session (see /reset-password). */
export async function resetPasswordAction(
  values: ResetPasswordInput
): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "This reset link has expired — request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "Couldn't update your password. Please try again." };
  }

  redirect("/dashboard");
}
