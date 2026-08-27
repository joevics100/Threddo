"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/ui";
import { transferListingAction } from "@/features/trust-safety/actions/admin.actions";
import {
  AdminUserPicker,
  type AdminPickableUser
} from "@/features/trust-safety/components/AdminUserPicker";

interface TransferListingDialogProps {
  listingId: string;
  currentSellerName: string | null;
  users: AdminPickableUser[];
  trigger: React.ReactNode;
}

/**
 * Lets an admin reassign an existing listing (any status) to a different
 * user — e.g. something the admin published under their own account that
 * should actually belong to the real seller. Status is left exactly as it
 * was; admins already have separate approve/reject controls for that.
 */
export function TransferListingDialog({
  listingId,
  currentSellerName,
  users,
  trigger
}: TransferListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminPickableUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleTransfer() {
    if (!selectedUser) return;
    setError(null);
    startTransition(async () => {
      const result = await transferListingAction(listingId, selectedUser.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSelectedUser(null);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSelectedUser(null);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer this listing</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-black/60">
          Currently owned by <span className="font-medium">{currentSellerName ?? "Unknown"}</span>.
          Pick who it should belong to instead — they&apos;ll be able to see, edit, and manage it
          immediately, exactly as if they&apos;d posted it themselves.
        </p>

        <AdminUserPicker users={users} selectedUser={selectedUser} onSelect={setSelectedUser} />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedUser || isPending}
            className="bg-[#1B1F3B] text-white hover:bg-[#2a2f5a]"
          >
            {isPending ? "Transferring…" : "Transfer listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
