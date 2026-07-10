import { z } from "zod";

export const reportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(["scam", "inappropriate", "wrong_category", "sold_elsewhere", "other"], {
    message: "Select a reason"
  }),
  details: z.string().trim().max(500).optional()
});

export type ReportInput = z.infer<typeof reportSchema>;

export const reviewSchema = z.object({
  listingId: z.string().uuid(),
  sellerId: z.string().uuid(),
  rating: z.number().int().min(1, "Select a rating").max(5),
  comment: z.string().trim().max(500).optional()
});

export type ReviewInput = z.infer<typeof reviewSchema>;
