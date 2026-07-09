import type { DeliveryMethod, ListingCondition, SuitableFor } from "@/types/database.types";

export const CONDITION_OPTIONS: { label: string; value: ListingCondition }[] = [
  { label: "New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Gently Used", value: "gently_used" },
  { label: "Needs Fixing", value: "needs_fixing" }
];

export const DELIVERY_METHOD_OPTIONS: { label: string; value: DeliveryMethod }[] = [
  { label: "Pickup", value: "pickup" },
  { label: "Delivery", value: "delivery" },
  { label: "Meet-Up", value: "meet_up" }
];

export const SUITABLE_FOR_OPTIONS: { label: string; value: SuitableFor }[] = [
  { label: "Unisex", value: "unisex" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Kids", value: "kids" }
];

// Free-text is also accepted (see schema) — this is a starter set for the
// segmented control, not an exhaustive/enforced enum in the database.
export const MATERIAL_OPTIONS: { label: string; value: string }[] = [
  { label: "Cotton", value: "Cotton" },
  { label: "Polyester", value: "Polyester" },
  { label: "Denim", value: "Denim" },
  { label: "Leather", value: "Leather" },
  { label: "Wool", value: "Wool" },
  { label: "Silk/Satin", value: "Silk/Satin" },
  { label: "Chiffon", value: "Chiffon" },
  { label: "Lace", value: "Lace" },
  { label: "Ankara/Adire", value: "Ankara/Adire" },
  { label: "Suede", value: "Suede" },
  { label: "Synthetic", value: "Synthetic" },
  { label: "Blend", value: "Blend" },
  { label: "Other", value: "Other" }
];

export const MAX_LISTING_IMAGES = 3;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
