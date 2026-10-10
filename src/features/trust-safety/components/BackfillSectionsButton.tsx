"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { backfillListingSectionsAction } from "@/features/trust-safety/actions/admin.actions";

/** Generates missing buyer-guide sections for approved listings, batch by batch. */
export function BackfillSectionsButton() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  async function run() {
    setRunning(true);
    try {
      for (let i = 0; i < 100; i++) {
        const result = await backfillListingSectionsAction();
        if (result.remaining !== undefined) setRemaining(result.remaining);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (!result.remaining) {
          toast.success("All approved listings now have buyer-guide sections.");
          return;
        }
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={run} disabled={running}>
      {running
        ? `Generating… ${remaining !== null ? `${remaining} left` : ""}`
        : "Generate missing buyer guides"}
    </Button>
  );
}
