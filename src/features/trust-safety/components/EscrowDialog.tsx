"use client";

import { siteConfig } from "@/config/site.config";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/ui";

export function EscrowDialog() {
  const hasSupportNumber = Boolean(siteConfig.escrowSupportWhatsAppLink);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Trade safely
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade safely on Threddo</DialogTitle>
          <DialogDescription>
            Threddo doesn&apos;t hold or process payments — buyers and sellers arrange payment
            directly between themselves, outside the app.
          </DialogDescription>
        </DialogHeader>

        <ol className="grid list-decimal gap-2 pl-5 text-sm text-black/70">
          <li>Meet in a public place, or verify the seller/item before paying in full.</li>
          <li>Avoid sending full payment upfront to someone you&apos;ve never met.</li>
          <li>Inspect the item (or ask for extra photos/video) before you complete payment.</li>
          <li>Use a bank transfer method that shows a confirmed receipt on both ends.</li>
          <li>If anything feels off, stop and report the listing or seller.</li>
        </ol>

        <DialogFooter>
          {hasSupportNumber ? (
            <Button asChild className="bg-[#25D366] text-white hover:opacity-90">
              <a
                href={siteConfig.escrowSupportWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat with Threddo support
              </a>
            </Button>
          ) : (
            <p className="text-sm text-black/50">
              Support contact coming soon — check back shortly.
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
