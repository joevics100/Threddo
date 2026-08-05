import "server-only";

import { env } from "@/env";

import { MATERIAL_OPTIONS } from "@/features/listings/constants/listing-options";

// Primary + fallback, in that order. These are current Gemini model IDs as
// of mid-2026 — if Google renames/retires one, update the strings here,
// nothing else needs to change.
const MODELS = ["gemini-3.1-flash-lite", "gemini-3-flash-preview"] as const;

const API_KEYS = [env.GEMINI_API_KEY_1, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(
  (key): key is string => Boolean(key)
);

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface AiListingSuggestion {
  title: string;
  description: string;
  categorySlug: string | null;
  subcategorySlug: string | null;
  brand: string | null;
  color: string | null;
  material: string | null;
  condition: "new" | "like_new" | "gently_used" | "needs_fixing";
  suitableFor: "unisex" | "male" | "female" | "kids";
}

function buildResponseSchema(categories: CategoryOption[]) {
  const categorySlugs = categories.filter((c) => !c.parent_id).map((c) => c.slug);
  const subcategorySlugs = categories.filter((c) => c.parent_id).map((c) => c.slug);

  return {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      categorySlug: { type: "string", enum: categorySlugs },
      subcategorySlug: { type: "string", enum: subcategorySlugs },
      brand: { type: "string" },
      color: { type: "string" },
      material: { type: "string", enum: MATERIAL_OPTIONS.map((o) => o.value) },
      condition: { type: "string", enum: ["new", "like_new", "gently_used", "needs_fixing"] },
      suitableFor: { type: "string", enum: ["unisex", "male", "female", "kids"] }
    },
    required: ["title", "description", "condition", "suitableFor"]
  };
}

function buildPrompt(categories: CategoryOption[]): string {
  const topLevel = categories.filter((c) => !c.parent_id);
  const categoryList = topLevel
    .map((cat) => {
      const subs = categories.filter((c) => c.parent_id === cat.id).map((s) => s.slug);
      return `- ${cat.slug}${subs.length ? ` (subcategories: ${subs.join(", ")})` : ""}`;
    })
    .join("\n");

  return `You are helping a seller in Nigeria list a secondhand fashion item on Threddo, a marketplace for clothes, shoes, bags, hair, and accessories.

Look at the photo and identify the single most prominent item for sale. Respond with ONLY a JSON object (no markdown, no commentary) matching this shape:

{
  "title": "short, specific title, max 8 words, e.g. 'Blue Denim Jacket' or 'Nike Air Max Sneakers'",
  "description": "A detailed, honest description, roughly 5-8 sentences (about 120-180 words). Cover: what the item is, its color and pattern, style/silhouette and fit, material or texture if visible, any notable design details (buttons, zippers, prints, stitching, hardware, logos), and a couple of ideas for how it could be worn or styled. Write in a natural, appealing tone a buyer would enjoy reading — not a dry bullet list. Do NOT claim a condition like 'brand new' or 'excellent condition' unless clearly evidenced (e.g. tags still attached, obvious packaging) — the seller will confirm the actual condition separately.",
  "categorySlug": "the closest matching slug from the list below, or omit if genuinely unclear",
  "subcategorySlug": "the closest matching subcategory slug under that category, or omit if unclear",
  "brand": "brand name only if a logo or label is clearly legible in the photo, otherwise omit",
  "color": "the item's primary color, or omit if unclear",
  "material": "the closest matching material from this exact list: ${MATERIAL_OPTIONS.map((o) => o.value).join(", ")} — or omit if none fit well",
  "condition": "your best visual guess: one of new, like_new, gently_used, needs_fixing — default to gently_used if you can't tell",
  "suitableFor": "one of unisex, male, female, kids — your best guess from the item's style, default to unisex if unclear"
}

Valid categories and subcategories:
${categoryList}

If the photo doesn't clearly show a sellable fashion item, still return your best-effort JSON with an empty title and a description of what you actually see.`;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  base64Image: string,
  mimeType: string,
  responseSchema: ReturnType<typeof buildResponseSchema>
): Promise<AiListingSuggestion> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.4
        }
      }),
      signal: AbortSignal.timeout(20_000)
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked this image: ${data.promptFeedback.blockReason}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text) as Partial<AiListingSuggestion>;

  return {
    title: parsed.title ?? "",
    description: parsed.description ?? "",
    categorySlug: parsed.categorySlug ?? null,
    subcategorySlug: parsed.subcategorySlug ?? null,
    brand: parsed.brand ?? null,
    color: parsed.color ?? null,
    material: parsed.material ?? null,
    condition: parsed.condition ?? "gently_used",
    suitableFor: parsed.suitableFor ?? "unisex"
  };
}

/**
 * Analyzes a single listing photo and suggests form field values. Rotates
 * across every configured API key × model combination (primary model first
 * on each key, then the fallback model) until one succeeds, so a single
 * rate-limited key or a transient model error doesn't fail the request.
 */
export async function analyzeListingImage(
  base64Image: string,
  mimeType: string,
  categories: CategoryOption[]
): Promise<AiListingSuggestion> {
  if (API_KEYS.length === 0) {
    throw new Error("AI photo analysis isn't configured yet.");
  }

  const prompt = buildPrompt(categories);
  const responseSchema = buildResponseSchema(categories);
  let lastError: unknown;

  for (const apiKey of API_KEYS) {
    for (const model of MODELS) {
      try {
        return await callGemini(apiKey, model, prompt, base64Image, mimeType, responseSchema);
      } catch (error) {
        lastError = error;
        // Try the next model on this key, then the next key entirely.
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Couldn't analyze this photo right now.");
}
