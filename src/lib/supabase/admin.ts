import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { env } from "@/env";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * ONLY for trusted, server-only code paths that have no user session to
 * authenticate with in the first place (cron jobs, webhooks) — never import
 * this into anything that runs for a request made by an ordinary user.
 * Regular Server Actions and Server Components should keep using
 * `@/lib/supabase/server`'s `createClient()`, which respects RLS.
 *
 * Throws if SUPABASE_SERVICE_ROLE_KEY isn't configured, rather than silently
 * falling back to a client with no real permissions.
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );
}
