"use client";

import { useTransition } from "react";
import Link from "next/link";

import type { ReportReason } from "@/types/database.types";

import { timeAgo } from "@/lib/date";

import { Button } from "@/ui";
import { resolveReportAction } from "@/features/trust-safety/actions/admin.actions";

export interface ReportRow {
  id: string;
  reason: ReportReason;
  details: string | null;
  created_at: string;
  listing_id: string;
  listing_title: string | null;
  reporter_name: string | null;
}

const REASON_LABELS: Record<ReportReason, string> = {
  scam: "Looks like a scam",
  inappropriate: "Inappropriate content",
  wrong_category: "Wrong category",
  sold_elsewhere: "Already sold elsewhere",
  other: "Something else"
};

export function ReportModerationRow({ report }: { report: ReportRow }) {
  const [isPending, startTransition] = useTransition();

  function handleResolve() {
    startTransition(() => {
      void resolveReportAction(report.id);
    });
  }

  return (
    <div className="rounded-xl border border-black/5 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/listings/${report.listing_id}`}
            target="_blank"
            className="font-semibold text-[#1B1F3B] hover:underline"
          >
            {report.listing_title ?? "Listing"}
          </Link>
          <p className="text-sm text-black/60">{REASON_LABELS[report.reason]}</p>
          {report.details ? <p className="mt-1 text-sm text-black/70">{report.details}</p> : null}
          <p className="mt-1 text-xs text-black/40">
            Reported by {report.reporter_name ?? "a user"} · {timeAgo(report.created_at)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleResolve}
          disabled={isPending}
        >
          Mark resolved
        </Button>
      </div>
    </div>
  );
}
