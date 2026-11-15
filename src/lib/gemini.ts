import "server-only";

import { env } from "@/env";

// Primary + fallback, in that order. These are current Gemini model IDs as
// of mid-2026 — if Google renames/retires one, update the strings here,
// nothing else needs to change.
export const MODELS = ["gemini-3.1-flash-lite", "gemini-3-flash-preview"] as const;

export const API_KEYS = [env.GEMINI_API_KEY_1, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(
  (key): key is string => Boolean(key)
);
