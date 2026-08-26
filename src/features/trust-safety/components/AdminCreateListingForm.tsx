"use client";

import { useState } from "react";

import { Layers, UserRound } from "lucide-react";

import type { CategoryOption } from "@/components/shared/CategorySelect";
import { BulkListingForm } from "@/features/listings/components/BulkListingForm";
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
  const [batchMode, setBatchMode] = useState<"one" | "many">("one");

  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Who is this listing for?</label>
        <AdminUserPicker users={users} selectedUser={selectedUser} onSelect={setSelectedUser} />
      </div>

      {selectedUser ? (
        <>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-[#1B1F3B]/5 p-1">
            <button
              type="button"
              onClick={() => setBatchMode("one")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
                batchMode === "one"
                  ? "bg-white text-[#1B1F3B] shadow-sm"
                  : "text-[#1B1F3B]/50 hover:text-[#1B1F3B]"
              }`}
            >
              <UserRound className="size-3.5" />
              One item
            </button>
            <button
              type="button"
              onClick={() => setBatchMode("many")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
                batchMode === "many"
                  ? "bg-white text-[#1B1F3B] shadow-sm"
                  : "text-[#1B1F3B]/50 hover:text-[#1B1F3B]"
              }`}
            >
              <Layers className="size-3.5" />
              Several items
            </button>
          </div>

          {batchMode === "one" ? (
            <PostListingForm
              key={`${selectedUser.id}-one`}
              categories={categories}
              defaultWhatsappNumber={selectedUser.whatsapp_number ?? ""}
              mode="admin-create"
              adminTargetUserId={selectedUser.id}
            />
          ) : (
            <BulkListingForm
              key={`${selectedUser.id}-many`}
              categories={categories}
              defaultWhatsappNumber={selectedUser.whatsapp_number ?? ""}
              mode="admin-create"
              adminTargetUserId={selectedUser.id}
            />
          )}
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-[#1B1F3B]/15 p-6 text-center text-sm text-black/50">
          Pick a user above to start their listing.
        </p>
      )}
    </div>
  );
}
