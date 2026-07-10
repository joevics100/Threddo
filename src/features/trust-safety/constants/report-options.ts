import type { ReportReason } from "@/types/database.types";

export const REPORT_REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: "Looks like a scam", value: "scam" },
  { label: "Inappropriate content", value: "inappropriate" },
  { label: "Wrong category", value: "wrong_category" },
  { label: "Already sold elsewhere", value: "sold_elsewhere" },
  { label: "Something else", value: "other" }
];
