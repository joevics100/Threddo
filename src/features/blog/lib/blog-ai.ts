import "server-only";

import { API_KEYS, MODELS } from "@/lib/gemini";

export interface BlogExtraction {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  content: string;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    excerpt: { type: "string" },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    content: { type: "string" }
  },
  required: ["title", "slug", "excerpt", "seoTitle", "seoDescription", "tags", "content"]
};

// Scissors-edit rules (a) and (b) below, and the "do not change other
// wording" rule, are copied verbatim from the rewriter used on the
// onlinetools blog — same instructions, only the returned field list is
// adapted to Threddo's blog_posts columns. Rule (c), on images, is new.
const EXTRACT_PROMPT_INSTRUCTIONS = `You are a precise editor. DO NOT rewrite, summarize, paraphrase, or reword the article. You may ONLY make surgical (scissors) edits. Preserve every heading, table, list, blockquote, paragraph, and the author's exact wording.

Return JSON with these fields:

1. "title" — the article's H1 / main title as plain text (no markdown).
2. "slug" — url slug for the article. If the content or title suggests one, use it; otherwise derive a kebab-case slug from the title (lowercase, hyphens).
3. "excerpt" — 1-2 sentence teaser (~200 chars max) drawn from the intro. Plain text, no markdown.
4. "seoTitle" — an SEO-optimized page title, under 60 characters, plain text.
5. "seoDescription" — SEO meta description under 155 chars, plain text.
6. "tags" — up to 5 short, lowercase, kebab-case tags describing the article's topics (e.g. ["thrifting", "style-tips", "lagos"]).
7. "content" — the SAME markdown, with ONLY the following scissors edits applied:

   a. LINK CLEANUP — the source often has citation clutter in one of two forms:

      FORM 1 — trailing bare-domain markdown links, e.g.: "automated PDFs for Nigerian businesses. [nitda.gov](https://nitda.gov.ng/...)".

      FORM 2 — numbered/bracketed reference markers (very common in Perplexity exports), e.g.: "sellers who disappear after payment.[4][5]" or "a growing problem in Lagos [12]." These may or may not have a matching reference-style definition elsewhere in the document (a line like "[4]: https://example.com" or a "Sources"/"References" list at the very end).

      For BOTH forms, across the WHOLE article:
      - Pick at most the 5 BEST, most authoritative underlying links (prefer official gov sites and primary sources) — checking reference-style definitions and any end-of-article Sources/References list for the real URL behind a numbered marker.
      - Delete every other citation marker/link entirely — the bracket numbers, the trailing bare-domain links, and any leading space or stray punctuation orphaned by the removal (e.g. "payment.[4][5]" becomes "payment." not "payment. []"). Keep the surrounding sentence intact.
      - For the kept 5, rewrite them as inline anchors integrated naturally into the nearest preceding sentence — turn a relevant NOUN PHRASE already in that sentence into the anchor text. E.g. "automated PDFs for Nigerian businesses. [nitda.gov](https://nitda.gov.ng/x)" becomes "automated PDFs for [Nigerian businesses](https://nitda.gov.ng/x)." For a numbered marker like "a growing problem in Lagos [12]." with [12] resolving to a real URL, becomes "a growing problem in [Lagos](https://the-url)." Do NOT invent new sentences or add commentary. If no reasonable noun phrase exists, drop that link too.
      - If a numbered marker has no resolvable URL anywhere in the document (a bare "[4]" pointing to nothing), just delete it — never leave an unresolved bracket number in the output.
      - Always delete any standalone "Sources" / "References" / footnote-definition section at the end of the article once you've extracted what you need from it — it should never appear in the final content.
      - Internal links (relative paths, same-site) are not counted against the 5-link cap; keep them and also inline them naturally the same way if they appear as trailing bare-domain citations.

   b. REMOVE AI COMMENTARY — the source often contains meta commentary aimed at the human editor. Remove all of the following completely:
      - Word-count notes: "(Word count: 1,240)", "**Word count:** ...", "Total words: ..."
      - Placeholders/notes: "TK", "TODO", "[insert stat here]"
      - Meta explanations of keywords/headings/SEO choices ("This heading targets the keyword ...", "I chose this title because ...", "Note to editor: ...")
      - Preambles/sign-offs: "Here is the article:", "Below is the rewritten piece:", "Let me know if you want ...", "I hope this helps ..."
      - Stray HTML tags that don't belong, duplicated headings, leftover prompt fragments

   c. IMAGES — the source may contain markdown image links (e.g. ![alt text](https://...)). Keep an image ONLY if it uses a real URL already present in the source AND is necessary to illustrate the article (a genuine diagram, screenshot, product photo, or hero image the text refers to). Remove any image markdown that is decorative filler, a placeholder, a broken/generic stock reference, or not clearly tied to the surrounding content. Do NOT invent, generate, or add any image link that isn't already in the source.

   d. Do NOT change any other wording. If a paragraph has no defects, return it verbatim.

CONTENT:
{{CONTENT}}`;

function buildPrompt(content: string): string {
  return EXTRACT_PROMPT_INSTRUCTIONS.replace("{{CONTENT}}", content);
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<BlogExtraction> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 20000,
          responseSchema: RESPONSE_SCHEMA
        }
      }),
      signal: AbortSignal.timeout(60_000)
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked this article: ${data.promptFeedback.blockReason}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text) as Partial<BlogExtraction>;

  return {
    title: parsed.title ?? "",
    slug: parsed.slug ?? "",
    excerpt: parsed.excerpt ?? "",
    seoTitle: parsed.seoTitle ?? "",
    seoDescription: parsed.seoDescription ?? "",
    tags: parsed.tags ?? [],
    content: parsed.content ?? ""
  };
}

/**
 * Takes a pasted markdown article (e.g. from Perplexity) and returns every
 * blog_posts field auto-filled: title, slug, excerpt, SEO title/description,
 * suggested tags, and the cleaned content. This does NOT rewrite or reword
 * the article — it only applies the scissors edits described above (link
 * cleanup, stripping AI commentary, and dropping unnecessary images).
 * Rotates across every configured Gemini API key × model combination until
 * one succeeds, same pattern as analyzeListingImage in lib/gemini.ts.
 */
export async function extractBlogPostFromMarkdown(content: string): Promise<BlogExtraction> {
  if (API_KEYS.length === 0) {
    throw new Error("AI blog rewriting isn't configured yet.");
  }

  const prompt = buildPrompt(content);
  let lastError: unknown;

  for (const apiKey of API_KEYS) {
    for (const model of MODELS) {
      try {
        return await callGemini(apiKey, model, prompt);
      } catch (error) {
        lastError = error;
        // Try the next model on this key, then the next key entirely.
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Couldn't process this article right now.");
}
