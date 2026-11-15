import type { ListingCondition } from "@/types/database.types";

const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "New",
  like_new: "Like New",
  gently_used: "Gently Used",
  needs_fixing: "Needs Fixing"
};

export function formatNaira(price: number | null): string {
  if (price === null) return "Donation";
  return `₦${price.toLocaleString("en-NG")}`;
}

export function getConditionLabel(condition: ListingCondition | null): string {
  return condition ? CONDITION_LABELS[condition] : "";
}
