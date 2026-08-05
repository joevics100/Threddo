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

const ESCROW_STEPS = [
  "Contact admin",
  "Create a WhatsApp group with the buyer, seller, and admin",
  "Buyer sends money to admin",
  "Seller sends the item",
  "Buyer confirms receipt",
  "Admin releases funds to seller"
];

export function EscrowDialog() {
  const hasSupportNumber = Boolean(siteConfig.escrowSupportWhatsAppLink);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Trade with Escrow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Threddo Escrow</DialogTitle>
          <DialogDescription>
            For extra peace of mind on higher-value items, Threddo admin can hold payment until
            you&apos;ve confirmed the item is as described. A 5% fee applies, deducted from the
            amount released to the seller.
          </DialogDescription>
        </DialogHeader>

        <ol className="grid list-decimal gap-2 pl-5 text-sm text-black/70">
          {ESCROW_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className="rounded-lg bg-[#E8A33D]/10 px-3 py-2 text-xs text-[#1B1F3B]">
          Escrow fee: <span className="font-semibold">5% of the item price</span>, covered by the
          seller from the released funds.
        </p>

        <DialogFooter>
          {hasSupportNumber ? (
            <Button asChild className="bg-[#25D366] text-white hover:opacity-90">
              <a
                href={siteConfig.escrowSupportWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact admin
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
