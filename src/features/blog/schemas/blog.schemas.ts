import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  excerpt: z
    .string()
    .trim()
    .min(20, "Add a short summary (at least 20 characters)")
    .max(300, "Keep the summary under 300 characters — it's used as the meta description too"),
  content: z.string().trim().min(50, "The post body needs more content (at least 50 characters)"),
  coverImageUrl: z.string().trim().url().or(z.literal("")).nullable().optional(),
  // Comma-separated in the form UI, split into an array before hitting the action.
  tags: z.array(z.string().trim().min(1)).max(8, "Up to 8 tags"),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(70).or(z.literal("")).nullable().optional(),
  seoDescription: z.string().trim().max(160).or(z.literal("")).nullable().optional()
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

/** Turns a title into a URL-safe slug — used to prefill the slug field, which stays editable. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
