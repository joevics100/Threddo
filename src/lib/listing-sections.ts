import "server-only";

import { API_KEYS, MODELS } from "@/lib/gemini";

import type { ListingDetailSection } from "@/features/listings/lib/detail-sections";

export interface ListingSectionsInput {
  title: string;
  description: string | null;
  categoryName: string | null;
  brand: string | null;
  color: string | null;
  material: string | null;
  condition: string;
  suitableFor: string;
  size: string | null;
  isFree: boolean;
  isNegotiable: boolean;
  state: string | null;
  lga: string | null;
}

const SECTION_TITLES = [
  "About this item",
  "Who is this for?",
  "How to style it",
  "What to check before you buy",
  "Care tips",
  "Buying safely on Threddo"
] as const;

function buildPrompt(input: ListingSectionsInput): string {
  const facts = [
    `Title: ${input.title}`,
    input.categoryName && `Category: ${input.categoryName}`,
    input.brand && `Brand: ${input.brand}`,
    input.color && `Color: ${input.color}`,
    input.material && `Material: ${input.material}`,
    `Condition (as stated by the seller): ${input.condition}`,
    `Suitable for: ${input.suitableFor}`,
    input.size && `Size: ${input.size}`,
    input.isFree ? "Offered free" : input.isNegotiable ? "Price negotiable" : "Fixed price",
    (input.state || input.lga) &&
      `Location: ${[input.lga, input.state].filter(Boolean).join(", ")}`,
    input.description && `Seller's description: ${input.description}`
  ]
    .filter(Boolean)
    .join("\n");

  return `You write helpful buyer-guide text for a listing on Threddo, a secondhand fashion marketplace in Nigeria where buyers and sellers deal directly over WhatsApp (no in-app payments).

LISTING FACTS (the only facts you may rely on):
${facts}

Write exactly these six sections, in this order, with these exact titles:
${SECTION_TITLES.map((t, i) => `${i + 1}. ${t}`).join("\n")}

RULES:
- Each section body is 70-110 words of plain prose (no markdown, no bullet characters, no headings). About 500 words in total.
- Use ONLY the listing facts above for anything specific to this item. NEVER invent measurements, flaws, brand authenticity, age, history, original price, or features that aren't in the facts.
- Everything else must be general, genuinely useful guidance that fits this type of item and material: who tends to wear it, ways to style it for Nigerian weather and occasions, what a careful buyer should inspect for this kind of item, and how to care for it.
- "What to check before you buy" is general inspection advice for this kind of item (seams, zips, soles, smell, stains, etc. as relevant) and reminds buyers to ask the seller for extra photos.
- "Buying safely on Threddo" covers: meet in a public place, inspect the item before paying, pay only on handover, and keep the chat on WhatsApp.
- Warm, plain, honest tone. No hype, no emojis, no promises about quality.

Respond with ONLY a JSON array of six objects: [{"title": "...", "body": "..."}, ...]`;
}

const RESPONSE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: { title: { type: "string" }, body: { type: "string" } },
    required: ["title", "body"]
  }
};

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callGemini(apiKey: string, model: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.5
        }
      }),
      signal: AbortSignal.timeout(30_000)
    }
  );

  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response");

  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Unexpected Gemini response shape");

  const sections: ListingDetailSection[] = parsed
    .filter(
      (item): item is ListingDetailSection =>
        !!item && typeof item.title === "string" && typeof item.body === "string"
    )
    .map((item) => ({ title: item.title.trim(), body: item.body.trim() }))
    .filter((item) => item.title && item.body);

  if (sections.length < 4) throw new Error("Gemini returned too few sections");

  return sections;
}

/**
 * Writes the collapsible buyer-guide sections for a listing. Rotates across
 * every configured API key × model until one succeeds. Throws if none do —
 * callers should treat that as "no sections yet", never as a blocker.
 */
export async function generateListingSections(
  input: ListingSectionsInput
): Promise<ListingDetailSection[]> {
  if (API_KEYS.length === 0) throw new Error("AI isn't configured yet.");

  const prompt = buildPrompt(input);
  let lastError: unknown;

  for (const apiKey of API_KEYS) {
    for (const model of MODELS) {
      try {
        return await callGemini(apiKey, model, prompt);
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Couldn't generate sections.");
}
