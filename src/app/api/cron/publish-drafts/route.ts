import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/env";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Hit on a schedule by an external cron service (cron-job.org) — publishes
 * every blog post currently in "draft" status, so posts queued up in the
 * admin blog editor go live automatically instead of needing someone to
 * remember to flip each one to "published" by hand.
 *
 * Auth is a shared secret in the query string rather than a session, since
 * the cron service has no way to log in as an admin — this is the only
 * route in the app that uses the service-role client for that reason.
 */
export async function GET(request: NextRequest) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }

  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Everything below can throw for reasons that have nothing to do with the
  // blog_posts update itself (most likely: SUPABASE_SERVICE_ROLE_KEY isn't
  // actually set in this environment, even though CRON_SECRET is) — without
  // this try/catch that surfaces as Next's generic, bodyless 500 page,
  // which gives whoever's debugging the cron run nothing to go on.
  try {
    const supabase = createAdminClient();

    const { data: published, error } = await supabase
      .from("blog_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("status", "draft")
      .select("id, slug, title");

    if (error) {
      return NextResponse.json(
        { error: `Couldn't publish drafts: ${error.message}` },
        {
          status: 500
        }
      );
    }

    if (published.length > 0) {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      published.forEach((p) => revalidatePath(`/blog/${p.slug}`));
    }

    return NextResponse.json({
      publishedCount: published.length,
      published: published.map((p) => ({ slug: p.slug, title: p.title }))
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error." },
      { status: 500 }
    );
  }
}
