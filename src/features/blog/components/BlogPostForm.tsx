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
import { extractBlogPostContentAction } from "@/features/blog/actions/blog.actions";
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
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

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

  async function handleAutoFill() {
    setAiError(null);
    setAiMessage(null);
    if (!rawMarkdown.trim()) {
      setAiError("Paste the article's markdown first.");
      return;
    }
    setIsExtracting(true);
    try {
      const result = await extractBlogPostContentAction(rawMarkdown);
      if (result.error || !result.data) {
        setAiError(result.error ?? "Couldn't process that article.");
        return;
      }
      const out = result.data;
      form.setValue("title", out.title, { shouldValidate: true });
      form.setValue("slug", out.slug, { shouldValidate: true });
      setSlugTouched(true);
      form.setValue("excerpt", out.excerpt, { shouldValidate: true });
      form.setValue("content", out.content, { shouldValidate: true });
      form.setValue("tags", out.tags, { shouldValidate: true });
      form.setValue("seoTitle", out.seoTitle, { shouldValidate: true });
      form.setValue("seoDescription", out.seoDescription, { shouldValidate: true });
      setAiMessage("Filled in the post from your article — review before saving.");
    } catch {
      setAiError("Couldn't process that article.");
    } finally {
      setIsExtracting(false);
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

  // react-hook-form's watch() returns a subscription function that the
  // React Compiler can't safely memoize — this is expected and the
  // compiler already handles it correctly by skipping memoization here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const coverImageUrl = form.watch("coverImageUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
        <div className="grid gap-3 rounded-xl border border-dashed border-black/10 bg-black/[.02] p-4">
          <div>
            <label className="text-sm font-medium">Paste article markdown</label>
            <p className="text-xs text-muted-foreground">
              Paste the raw markdown (e.g. from Perplexity) and click Auto-fill — it fills in the
              title, slug, excerpt, tags, SEO title/description, and a cleaned version of the
              content below.
            </p>
          </div>
          <textarea
            value={rawMarkdown}
            onChange={(e) => setRawMarkdown(e.target.value)}
            rows={8}
            placeholder="## Heading&#10;&#10;Paste the full markdown article here…"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleAutoFill}
              disabled={isExtracting}
              className="w-fit bg-[#1B1F3B] text-white hover:bg-[#2a3060]"
            >
              {isExtracting ? "Auto-filling…" : "Auto-fill with AI"}
            </Button>
            {aiMessage ? <p className="text-sm text-emerald-600">{aiMessage}</p> : null}
            {aiError ? <p className="text-sm text-destructive">{aiError}</p> : null}
          </div>
        </div>

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
