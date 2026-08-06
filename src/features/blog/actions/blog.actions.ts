"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { blogPostSchema, type BlogPostInput } from "@/features/blog/schemas/blog.schemas";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, isAdmin: profile?.role === "admin" };
}

export interface BlogActionResult {
  error?: string;
}

export async function createBlogPostAction(values: BlogPostInput): Promise<BlogActionResult> {
  const parsed = blogPostSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) {
    return { error: "You don't have permission to do that." };
  }

  const data = parsed.data;
  const { error } = await supabase.from("blog_posts").insert({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image_url: data.coverImageUrl || null,
    tags: data.tags,
    status: data.status,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
    author_id: user.id,
    published_at: data.status === "published" ? new Date().toISOString() : null
  });

  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already in use." : "Couldn't create the post."
    };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateBlogPostAction(
  postId: string,
  values: BlogPostInput
): Promise<BlogActionResult> {
  const parsed = blogPostSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) {
    return { error: "You don't have permission to do that." };
  }

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", postId)
    .single();

  const data = parsed.data;
  // Only stamp published_at the first time a post goes live — re-saving an
  // already-published post shouldn't reset its publish date.
  const publishedAt =
    data.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : null;

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image_url: data.coverImageUrl || null,
      tags: data.tags,
      status: data.status,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      published_at: publishedAt
    })
    .eq("id", postId);

  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already in use." : "Couldn't save the post."
    };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(postId: string): Promise<BlogActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) {
    return { error: "You don't have permission to do that." };
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) {
    return { error: "Couldn't delete the post." };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return {};
}
