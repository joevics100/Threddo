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
