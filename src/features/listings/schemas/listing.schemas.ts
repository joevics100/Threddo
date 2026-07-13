import { z } from "zod";

const listingFields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z
    .string()
    .trim()
    .min(20, "Add a bit more detail (at least 20 characters)")
    .max(2000),
  price: z.string().optional(),
  isFree: z.boolean(),
  isNegotiable: z.boolean(),
  categoryId: z.string().uuid("Select a category"),
  subcategoryId: z.string().uuid().nullable(),
  suitableFor: z.enum(["unisex", "male", "female", "kids"], {
    message: "Select who this is suitable for"
  }),
  brand: z.string().trim().max(80).optional(),
  condition: z.enum(["new", "like_new", "gently_used", "needs_fixing"], {
    message: "Select a condition"
  }),
  size: z.string().trim().max(40).optional(),
  color: z.string().trim().max(60).optional(),
  material: z.string().trim().max(60).nullable().optional(),
  state: z.string().min(1, "Select a state"),
  lga: z.string().min(1, "Select an LGA"),
  town: z.string().trim().max(80).optional(),
  deliveryMethod: z.enum(["pickup", "delivery", "meet_up"], {
    message: "Select a delivery method"
  }),
  whatsappNumber: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20, "Enter a valid WhatsApp number"),
  allowCalls: z.boolean()
};

function withPriceRefinement<T extends z.ZodType<{ isFree: boolean; price?: string }>>(schema: T) {
  return schema.refine((data) => data.isFree || (!!data.price && Number(data.price) > 0), {
    message: "Enter a price, or check \u201cI want to donate this item\u201d",
    path: ["price"]
  });
}

// Used by the client form's resolver. Deliberately excludes `images` — photo
// files live in separate component state (not react-hook-form) since they
// need to be uploaded to Storage before we have URLs to validate. Validating
// an always-empty placeholder field here silently blocked every submission.
export const listingFormSchema = withPriceRefinement(z.object(listingFields));
export type ListingFormInput = z.infer<typeof listingFormSchema>;

// Used server-side, after photos are uploaded and we have real URLs.
export const listingSchema = withPriceRefinement(
  z.object({
    ...listingFields,
    images: z
      .array(z.string().url())
      .min(1, "Add at least one photo")
      .max(3, "You can add up to 3 photos")
  })
);
export type ListingInput = z.infer<typeof listingSchema>;
