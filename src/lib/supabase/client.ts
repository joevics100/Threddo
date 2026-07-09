import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { env } from "@/env";

/**
 * Supabase client for Client Components ("use client").
 * Reads the session from cookies via @supabase/ssr's browser storage adapter.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
