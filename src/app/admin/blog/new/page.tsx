"use client";

import { createBlogPostAction } from "@/features/blog/actions/blog.actions";
import { BlogPostForm } from "@/features/blog/components/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1B1F3B]">New post</h2>
      <div className="mt-6 max-w-2xl">
        <BlogPostForm mode="create" onSubmit={createBlogPostAction} />
      </div>
    </div>
  );
}
