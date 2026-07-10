"use client";

import { NIGERIAN_LGAS, NIGERIAN_STATES } from "@/data/nigeria-locations";

interface LocationSelectProps {
  state: string | null;
  lga: string | null;
  onStateChange: (state: string | null) => void;
  onLgaChange: (lga: string | null) => void;
  disabled?: boolean;
  /** "grid" = state/LGA side by side (default), "stack" = full-width stacked — useful in narrow sidebars. */
  layout?: "grid" | "stack";
}

const selectClass =
  "w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D] disabled:bg-black/5 disabled:text-black/40";

/**
 * Reusable State → LGA cascading picker, backed by the complete
 * `src/data/nigeria-locations.ts` reference data (no DB round trip needed).
 *
 * Used on the "post a listing" form and the browse/filter bar.
 */
export function LocationSelect({
  state,
  lga,
  onStateChange,
  onLgaChange,
  disabled,
  layout = "grid"
}: LocationSelectProps) {
  const lgas = state ? (NIGERIAN_LGAS[state] ?? []) : [];

  const wrapperClass = layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid gap-4";

  return (
    <div className={wrapperClass}>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">State</label>
        <select
          value={state ?? ""}
          disabled={disabled}
          onChange={(e) => {
            onStateChange(e.target.value || null);
            onLgaChange(null);
          }}
          className={selectClass}
        >
          <option value="">Select a state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">LGA</label>
        <select
          value={lga ?? ""}
          disabled={disabled || !state}
          onChange={(e) => onLgaChange(e.target.value || null)}
          className={selectClass}
        >
          <option value="">{state ? "Select an LGA" : "Select a state first"}</option>
          {lgas.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
