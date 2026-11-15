import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Public blog and homepage requests never need a session, so they skip the
  // Supabase round trip entirely (faster, cheaper, and cacheable). Only the
  // admin area and the auth pages — which do use sessions — go through it.
  matcher: ["/admin/:path*", "/login", "/forgot-password", "/reset-password", "/auth/:path*"]
};
