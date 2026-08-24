"use client";

import { useState } from "react";

import type { CategoryOption } from "@/components/shared/CategorySelect";
import { PostListingForm } from "@/features/listings/components/PostListingForm";
import {
  AdminUserPicker,
  type AdminPickableUser
} from "@/features/trust-safety/components/AdminUserPicker";

interface AdminCreateListingFormProps {
  categories: CategoryOption[];
  users: AdminPickableUser[];
  initialSelectedUser: AdminPickableUser | null;
}

export function AdminCreateListingForm({
  categories,
  users,
  initialSelectedUser
}: AdminCreateListingFormProps) {
  const [selectedUser, setSelectedUser] = useState<AdminPickableUser | null>(initialSelectedUser);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Who is this listing for?</label>
        <AdminUserPicker users={users} selectedUser={selectedUser} onSelect={setSelectedUser} />
      </div>

      {selectedUser ? (
        <PostListingForm
          key={selectedUser.id}
          categories={categories}
          defaultWhatsappNumber={selectedUser.whatsapp_number ?? ""}
          mode="admin-create"
          adminTargetUserId={selectedUser.id}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-[#1B1F3B]/15 p-6 text-center text-sm text-black/50">
          Pick a user above to start their listing.
        </p>
      )}
    </div>
  );
}
