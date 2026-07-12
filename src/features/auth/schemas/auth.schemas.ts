import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type SignupInput = z.infer<typeof signupSchema>;
