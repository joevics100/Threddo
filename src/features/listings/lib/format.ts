import type { DeliveryMethod, ListingCondition } from "@/types/database.types";

import {
  CONDITION_OPTIONS,
  DELIVERY_METHOD_OPTIONS
} from "@/features/listings/constants/listing-options";

export function formatNaira(price: number | null): string {
  if (price === null) return "Free";
  return `₦${price.toLocaleString("en-NG")}`;
}

export function getConditionLabel(condition: ListingCondition | null): string {
  return CONDITION_OPTIONS.find((option) => option.value === condition)?.label ?? "";
}

export function getDeliveryMethodLabel(method: DeliveryMethod | null): string {
  return DELIVERY_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? "";
}

/**
 * Normalizes a Nigerian phone number to international format for wa.me links
 * (e.g. "080..." -> "234..."). Leaves already-international numbers as-is.
 */
export function toInternationalNigerianNumber(rawNumber: string): string {
  const digitsOnly = rawNumber.replace(/\D/g, "");
  if (digitsOnly.startsWith("234")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `234${digitsOnly.slice(1)}`;
  return digitsOnly;
}

export function buildWhatsAppLink(rawNumber: string, message: string): string {
  const international = toInternationalNigerianNumber(rawNumber);
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
