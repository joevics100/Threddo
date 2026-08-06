import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { Breadcrumbs } from "@/components/shared";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips on secondhand fashion, thrifting, and getting the most out of buying and selling on Threddo — Nigeria's marketplace for clothes, shoes, bags, and more.",
  alternates: { canonical: "/blog" }
};

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, tags, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 pb-24 sm:pb-12">
      <Breadcrumbs items={[{ name: "Blog" }]} />

      <h1 className="text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B]">Threddo Blog</h1>
      <p className="mt-2 max-w-2xl text-black/60">
        Tips on secondhand fashion, thrifting smart, and getting the most out of buying and selling
        in Nigeria.
      </p>

      {posts && posts.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video bg-black/5">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-5">
                {post.tags && post.tags.length > 0 ? (
                  <p className="text-xs font-semibold tracking-wide text-[#E8A33D] uppercase">
                    {post.tags[0]}
                  </p>
                ) : null}
                <h2 className="mt-1 text-lg font-[var(--font-display)] font-bold text-[#1B1F3B] group-hover:underline">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-black/60">{post.excerpt}</p>
                {post.published_at ? (
                  <p className="mt-3 text-xs text-black/40">
                    {new Date(post.published_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-black/50">Nothing published yet — check back soon.</p>
      )}
    </main>
  );
}
