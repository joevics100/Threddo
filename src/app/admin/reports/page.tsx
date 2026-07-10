import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import {
  ReportModerationRow,
  type ReportRow
} from "@/features/trust-safety/components/ReportModerationRow";

interface AdminReportsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const { status: statusParam } = await searchParams;
  const status = statusParam === "resolved" ? "resolved" : "open";

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      "id, reason, details, created_at, listing_id, listing:listings(title), reporter:profiles!reports_reporter_id_fkey(full_name)"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  const rows: ReportRow[] = (reports ?? []).map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    created_at: r.created_at,
    listing_id: r.listing_id,
    listing_title: r.listing?.title ?? null,
    reporter_name: r.reporter?.full_name ?? null
  }));

  return (
    <div>
      <div className="flex gap-2">
        <Link
          href="/admin/reports?status=open"
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            status === "open"
              ? "bg-[#1B1F3B] text-white"
              : "bg-black/5 text-[#1B1F3B] hover:bg-black/10"
          }`}
        >
          Open
        </Link>
        <Link
          href="/admin/reports?status=resolved"
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            status === "resolved"
              ? "bg-[#1B1F3B] text-white"
              : "bg-black/5 text-[#1B1F3B] hover:bg-black/10"
          }`}
        >
          Resolved
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.length > 0 ? (
          rows.map((report) => <ReportModerationRow key={report.id} report={report} />)
        ) : (
          <p className="text-sm text-black/50">No {status} reports.</p>
        )}
      </div>
    </div>
  );
}
