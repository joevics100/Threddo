import Link from "next/link";

import { Pencil, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { DeleteBlogPostButton } from "@/features/blog/components/DeleteBlogPostButton";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1B1F3B]">Blog posts</h2>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#1B1F3B] transition hover:bg-[#f0b563]"
        >
          <Plus className="size-4" />
          New post
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1B1F3B]">{post.title}</p>
                <p className="text-xs text-black/50">/blog/{post.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    post.status === "published"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-black/5 text-black/60"
                  }`}
                >
                  {post.status}
                </span>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#1B1F3B] transition hover:bg-black/5"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
                <DeleteBlogPostButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-black/50">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
