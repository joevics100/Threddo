"use client";

import { NIGERIA_STATES } from "@/data/nigeria-locations";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

interface LocationSelectProps {
  state: string | null;
  lga: string | null;
  onStateChange: (state: string | null) => void;
  onLgaChange: (lga: string | null) => void;
  disabled?: boolean;
}

/**
 * Reusable State → LGA cascading picker, backed by the curated
 * `src/data/nigeria-locations.ts` reference data (no DB round trip needed).
 *
 * Used on the "post a listing" form and, later, the browse/filter bar.
 */
export function LocationSelect({
  state,
  lga,
  onStateChange,
  onLgaChange,
  disabled
}: LocationSelectProps) {
  const lgas = NIGERIA_STATES.find((s) => s.state === state)?.lgas ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">State</label>
        <Select
          value={state ?? undefined}
          onValueChange={(value) => {
            onStateChange(value);
            onLgaChange(null);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            {NIGERIA_STATES.map((s) => (
              <SelectItem key={s.state} value={s.state}>
                {s.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">LGA</label>
        <Select value={lga ?? undefined} onValueChange={onLgaChange} disabled={disabled || !state}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={state ? "Select an LGA" : "Pick a state first"} />
          </SelectTrigger>
          <SelectContent>
            {lgas.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
