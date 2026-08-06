"use client";

import { updateBlogPostAction } from "@/features/blog/actions/blog.actions";
import { BlogPostForm } from "@/features/blog/components/BlogPostForm";
import type { BlogPostInput } from "@/features/blog/schemas/blog.schemas";

export function EditBlogPostForm({
  postId,
  defaultValues
}: {
  postId: string;
  defaultValues: BlogPostInput;
}) {
  return (
    <BlogPostForm
      mode="edit"
      postId={postId}
      defaultValues={defaultValues}
      onSubmit={(values) => updateBlogPostAction(postId, values)}
    />
  );
}
