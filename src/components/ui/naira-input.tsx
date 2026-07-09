"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface NairaInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> {
  value: string;
  onValueChange: (rawDigits: string) => void;
}

/**
 * Text input for entering a naira amount. Users only ever type digits — the
 * display is formatted with thousand separators as they type, and the raw
 * digit string (no commas) is what gets passed to `onValueChange`/stored.
 */
export function NairaInput({ value, onValueChange, className, ...props }: NairaInputProps) {
  const displayValue = value ? Number(value).toLocaleString("en-NG") : "";

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        ₦
      </span>
      <input
        inputMode="numeric"
        type="text"
        value={displayValue}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D/g, "");
          onValueChange(digitsOnly);
        }}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent py-1 pr-3 pl-7 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
    </div>
  );
}
