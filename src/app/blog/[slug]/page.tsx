import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site.config";

import { absoluteUrl, JsonLd } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

import { Breadcrumbs, MarkdownContent } from "@/components/shared";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, cover_image_url, tags, seo_title, seo_description, published_at, updated_at, author:profiles(full_name)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return post;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const url = `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }]
        : undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  const { data: related } =
    post.tags && post.tags.length > 0
      ? await supabase
          .from("blog_posts")
          .select("id, title, slug, cover_image_url")
          .eq("status", "published")
          .neq("id", post.id)
          .overlaps("tags", post.tags)
          .order("published_at", { ascending: false })
          .limit(3)
      : { data: [] };

  const authorName = post.author?.full_name || siteConfig.name;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24 sm:pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image_url ? [post.cover_image_url] : undefined,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          author: { "@type": post.author?.full_name ? "Person" : "Organization", name: authorName },
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.ogImage) }
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) }
        }}
      />

      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: post.title }]} />

      {post.tags && post.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#E8A33D]/10 px-2.5 py-1 text-xs font-semibold text-[#E8A33D]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className="mt-3 text-3xl font-[var(--font-display)] font-bold text-[#1B1F3B] md:text-4xl">
        {post.title}
      </h1>

      <div className="mt-3 flex items-center gap-2 text-sm text-black/50">
        <span>{authorName}</span>
        {post.published_at ? (
          <>
            <span>·</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </time>
          </>
        ) : null}
      </div>

      {post.cover_image_url ? (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-black/5">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="mt-8">
        <MarkdownContent content={post.content} />
      </div>

      {related && related.length > 0 ? (
        <div className="mt-16 border-t border-black/10 pt-8">
          <h2 className="text-xl font-[var(--font-display)] font-bold text-[#1B1F3B]">
            Related posts
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video bg-black/5">
                  {r.cover_image_url ? (
                    <Image
                      src={r.cover_image_url}
                      alt={r.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="p-3 text-sm font-semibold text-[#1B1F3B] group-hover:underline">
                  {r.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-12 rounded-2xl bg-[#1B1F3B] p-6 text-center text-white">
        <p className="font-medium">Have something to give away or sell?</p>
        <p className="mt-1 text-sm text-white/70">
          <Link href="/post" className="font-semibold text-[#E8A33D] hover:underline">
            Post your first listing
          </Link>{" "}
          — it only takes a couple of minutes.
        </p>
      </div>
    </main>
  );
}
