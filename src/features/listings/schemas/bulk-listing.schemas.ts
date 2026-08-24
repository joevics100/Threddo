import { z } from "zod";

import { listingFields, withPriceRefinement } from "@/features/listings/schemas/listing.schemas";

/**
 * Fields that almost certainly don't vary across a batch of items someone's
 * listing in one sitting — where they are, how they'll deliver, and how to
 * reach them. Entered once at the top of the bulk form instead of once per
 * item, since re-typing your WhatsApp number 8 times is exactly the kind of
 * friction that would defeat the point of a "list several items at once"
 * feature.
 */
export const bulkSharedSchema = z.object({
  state: listingFields.state,
  lga: listingFields.lga,
  town: listingFields.town,
  deliveryMethod: listingFields.deliveryMethod,
  whatsappNumber: listingFields.whatsappNumber,
  allowCalls: listingFields.allowCalls,
  termsAccepted: listingFields.termsAccepted
});
export type BulkSharedInput = z.infer<typeof bulkSharedSchema>;

/**
 * Everything that genuinely is per-item — what it is, what it costs,
 * what condition it's in. One photo per item in bulk mode (versus up to 3
 * for a normally-posted listing) keeps the initial batch-creation flow
 * fast; more photos can be added afterward from the normal edit page.
 */
export const bulkItemFieldsSchema = withPriceRefinement(
  z.object({
    title: listingFields.title,
    description: listingFields.description,
    price: listingFields.price,
    isFree: listingFields.isFree,
    isNegotiable: listingFields.isNegotiable,
    quantity: listingFields.quantity,
    categoryId: listingFields.categoryId,
    subcategoryId: listingFields.subcategoryId,
    suitableFor: listingFields.suitableFor,
    brand: listingFields.brand,
    condition: listingFields.condition,
    size: listingFields.size,
    color: listingFields.color,
    material: listingFields.material
  })
);
export type BulkItemInput = z.infer<typeof bulkItemFieldsSchema>;
