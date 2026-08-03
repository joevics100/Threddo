import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Google sign-in doesn't collect a phone number, but Threddo needs one on
// every account (it's the default WhatsApp contact on listings) — this
// backs the one-field "complete your profile" step shown right after.
export const phoneOnlySchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
});

export type PhoneOnlyInput = z.infer<typeof phoneOnlySchema>;
