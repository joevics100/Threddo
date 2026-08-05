"use server";

import { analyzeListingImage, type AiListingSuggestion, type CategoryOption } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export interface AnalyzeListingImageResult {
  suggestion?: AiListingSuggestion;
  error?: string;
}

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
    return { error: "That photo is too large to analyze." };
  }

  try {
    const suggestion = await analyzeListingImage(base64Image, mimeType, categories);
    return { suggestion };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Couldn't analyze this photo right now. You can still fill in the details yourself."
    };
  }
}
