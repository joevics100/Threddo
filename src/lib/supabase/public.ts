import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { env } from "@/env";

/**
 * Cookie-less, anonymous Supabase client for pages that only read data
 * anyone is allowed to see (approved listings, categories). Because it never
 * touches the request's cookies, a page using it can be statically generated
 * and cached instead of being rendered fresh for every visitor.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
