"use client";

import { useState } from "react";

import { ChevronRight, User } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { SettingsForm } from "@/features/account/components/SettingsForm";

interface ContactDialogProps {
  defaultFullName: string;
  defaultPhone: string;
}

/**
 * Renders like any other SettingsRow, but opens the contact-details form in a
 * dialog instead of navigating away — editing name/WhatsApp number is a
 * one-off action, not its own page.
 */
export function ContactDialog({ defaultFullName, defaultPhone }: ContactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-black/[0.02]"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1F3B]/5 text-[#1B1F3B]">
          <User className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1B1F3B]">Name & contact number</p>
          <p className="truncate text-sm text-black/50">
            {defaultFullName || "Add your name"} · {defaultPhone || "No number yet"}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-black/30" />
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name & contact number</DialogTitle>
        </DialogHeader>
        <SettingsForm defaultFullName={defaultFullName} defaultPhone={defaultPhone} />
      </DialogContent>
    </Dialog>
  );
}
