"use client";

import { useState, useTransition } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  SegmentedControl
} from "@/ui";
import { createReportAction } from "@/features/trust-safety/actions/report.actions";
import { REPORT_REASON_OPTIONS } from "@/features/trust-safety/constants/report-options";

interface ReportListingDialogProps {
  listingId: string;
}

export function ReportListingDialog({ listingId }: ReportListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setError(null);
    if (!reason) {
      setError("Select a reason");
      return;
    }

    startTransition(async () => {
      const result = await createReportAction({
        listingId,
        reason: reason as (typeof REPORT_REASON_OPTIONS)[number]["value"],
        details
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSubmitted(false);
          setReason(undefined);
          setDetails("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Report listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Report submitted</DialogTitle>
              <DialogDescription>
                Thanks — our team will take a look. You can close this dialog now.
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report this listing</DialogTitle>
              <DialogDescription>
                Let us know what&apos;s wrong — reports are only visible to Threddo admins.
              </DialogDescription>
            </DialogHeader>

            <SegmentedControl
              options={REPORT_REASON_OPTIONS}
              value={reason}
              onValueChange={setReason}
            />

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Any extra details? (optional)"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Submitting…" : "Submit report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
