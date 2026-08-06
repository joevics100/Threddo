import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EditBlogPostForm } from "@/features/blog/components/EditBlogPostForm";
import type { BlogPostInput } from "@/features/blog/schemas/blog.schemas";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();

  if (!post) {
    notFound();
  }

  const defaultValues: BlogPostInput = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.cover_image_url ?? "",
    tags: post.tags ?? [],
    status: post.status,
    seoTitle: post.seo_title ?? "",
    seoDescription: post.seo_description ?? ""
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1B1F3B]">Edit post</h2>
      <div className="mt-6 max-w-2xl">
        <EditBlogPostForm postId={post.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
