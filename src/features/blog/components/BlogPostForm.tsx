"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  SegmentedControl
} from "@/ui";
import { getBlogCoverUploadUrl } from "@/features/blog/actions/blog-upload.actions";
import { blogPostSchema, slugify, type BlogPostInput } from "@/features/blog/schemas/blog.schemas";
import { compressListingImage } from "@/features/listings/lib/compress-image";

interface BlogPostFormProps {
  mode: "create" | "edit";
  postId?: string;
  defaultValues?: BlogPostInput;
  onSubmit: (values: BlogPostInput) => Promise<{ error?: string } | void>;
}

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" as const },
  { label: "Published", value: "published" as const }
];

export function BlogPostForm({ mode, defaultValues, onSubmit }: BlogPostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const form = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: defaultValues ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      tags: [],
      status: "draft",
      seoTitle: "",
      seoDescription: ""
    }
  });

  async function handleCoverSelected(file: File | undefined) {
    if (!file) return;
    setIsUploadingCover(true);
    setFormError(null);
    try {
      const compressed = await compressListingImage(file);
      const { uploadUrl, publicUrl, error } = await getBlogCoverUploadUrl(
        compressed.name,
        compressed.type,
        compressed.size
      );
      if (error || !uploadUrl || !publicUrl) {
        setFormError(error ?? "Couldn't prepare the image for upload.");
        return;
      }
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": compressed.type },
        body: compressed
      });
      if (!response.ok) {
        setFormError("Couldn't upload the cover image.");
        return;
      }
      form.setValue("coverImageUrl", publicUrl, { shouldValidate: true });
    } catch {
      setFormError("Couldn't upload the cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  function handleSubmit(values: BlogPostInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  }

  const coverImageUrl = form.watch("coverImageUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched) {
                      form.setValue("slug", slugify(e.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    setSlugTouched(true);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                threddo.com.ng/blog/{field.value || "your-post-slug"}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="A short summary shown on the blog index and used as the meta description"
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2">
          <label className="text-sm font-medium">Cover image</label>
          {coverImageUrl ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg bg-black/5">
              <Image
                src={coverImageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <label className="w-fit cursor-pointer rounded-lg border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-accent">
            {isUploadingCover ? "Uploading…" : coverImageUrl ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingCover}
              className="hidden"
              onChange={(e) => {
                void handleCoverSelected(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={18}
                  placeholder="## Heading&#10;&#10;Write in Markdown — headings, **bold**, lists, [links](https://example.com), images, etc."
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  value={field.value.join(", ")}
                  placeholder="e.g. thrifting, style-tips, lagos"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Comma-separated. Used for the &ldquo;related posts&rdquo; section.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO title (optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="Defaults to the title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO description (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Defaults to the excerpt"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Status</label>
          <SegmentedControl
            options={STATUS_OPTIONS}
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value as "draft" | "published")}
          />
        </div>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <Button
          type="submit"
          disabled={isPending || isUploadingCover}
          className="w-fit bg-[#E8A33D] text-[#1B1F3B] hover:bg-[#f0b563]"
        >
          {isPending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
