import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { env } from "@/env";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Must be created fresh on every request (never module-level singleton) because
 * it binds to the current request's cookies for auth.
 *
 * The `setAll` call can throw when invoked from a Server Component (which is not
 * allowed to set cookies) — that's expected and safe to ignore here as long as
 * `middleware.ts` is refreshing the session on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — ignore, middleware handles refresh.
          }
        }
      }
    }
  );
}
