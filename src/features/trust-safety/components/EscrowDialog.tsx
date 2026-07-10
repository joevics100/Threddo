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
  const hasGroupLink = Boolean(siteConfig.escrowWhatsAppGroupUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Use Escrow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade safer with Escrow</DialogTitle>
          <DialogDescription>
            A neutral moderator holds payment until the buyer confirms the item arrived as
            described.
          </DialogDescription>
        </DialogHeader>

        <ol className="grid list-decimal gap-2 pl-5 text-sm text-black/70">
          <li>Join the Threddo Escrow WhatsApp group using the link below.</li>
          <li>Message the moderator with both usernames and the agreed price.</li>
          <li>Buyer sends payment to the moderator, not the seller directly.</li>
          <li>Seller ships or hands over the item; buyer confirms it&apos;s as described.</li>
          <li>Moderator releases payment to the seller.</li>
        </ol>

        <DialogFooter>
          {hasGroupLink ? (
            <Button asChild className="bg-[#25D366] text-white hover:opacity-90">
              <a href={siteConfig.escrowWhatsAppGroupUrl} target="_blank" rel="noopener noreferrer">
                Join WhatsApp group
              </a>
            </Button>
          ) : (
            <p className="text-sm text-black/50">
              Escrow group link coming soon — check back shortly.
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
