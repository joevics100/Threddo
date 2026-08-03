import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only ever redirect to a same-site path — never follow an absolute/external URL from a query param.
  const next = searchParams.get("next");
  const safeNext = next?.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const {
      data: { session },
      error
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", session.user.id)
        .single();

      // Every Threddo account needs a phone number (it's the default
      // listing contact) — Google never provides one, so first-time Google
      // sign-ins get routed through a one-field step before continuing on.
      if (!profile?.phone) {
        return NextResponse.redirect(
          `${origin}/onboarding/phone?next=${encodeURIComponent(safeNext)}`
        );
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
