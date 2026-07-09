"use client";

import * as React from "react";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps extends Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "onChange"
> {
  options: SegmentedControlOption[];
}

/**
 * Horizontal pill/segmented selector — a11y-friendly radio group under the
 * hood. Used for single-choice fields presented as a "slider" in the design
 * (condition, material, delivery method) rather than a native <select>.
 */
export function SegmentedControl({ options, className, ...props }: SegmentedControlProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented-control"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className={cn(
            "rounded-full border border-input px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "data-[state=checked]:border-[#1B1F3B] data-[state=checked]:bg-[#1B1F3B] data-[state=checked]:text-white"
          )}
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
