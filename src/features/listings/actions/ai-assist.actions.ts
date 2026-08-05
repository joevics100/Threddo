"use server";

import { analyzeListingImage, type AiListingSuggestion, type CategoryOption } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export interface AnalyzeListingImageResult {
  suggestion?: AiListingSuggestion;
  error?: string;
}

// Shown to sellers regardless of what actually went wrong (missing API key,
// rate limit, model error, malformed response, etc.) — none of that is
// useful or reassuring to a seller, they just need to know to fill it in
// themselves. The real reason is still logged server-side below.
const GENERIC_ERROR = "AI parsing didn't work — please fill out the form.";

export async function analyzeListingImageAction(
  base64Image: string,
  mimeType: string,
  categories: CategoryOption[]
): Promise<AnalyzeListingImageResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." };
  }

  // Compressed listing photos land around 150-200KB — this is a generous
  // ceiling against something unexpected slipping through client-side.
  const approxBytes = (base64Image.length * 3) / 4;
  if (approxBytes > 2 * 1024 * 1024) {
    return { error: GENERIC_ERROR };
  }

  try {
    const suggestion = await analyzeListingImage(base64Image, mimeType, categories);
    return { suggestion };
  } catch (error) {
    console.error("AI listing analysis failed:", error);
    return { error: GENERIC_ERROR };
  }
}
