"use client";

import { useMemo, useState } from "react";

import { Search, X } from "lucide-react";

import { SellerAvatar } from "@/components/shared/SellerAvatar";

export interface AdminPickableUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  whatsapp_number: string | null;
  is_banned: boolean;
}

interface AdminUserPickerProps {
  users: AdminPickableUser[];
  selectedUser: AdminPickableUser | null;
  onSelect: (user: AdminPickableUser | null) => void;
}

/**
 * Simple client-side search — filters the already-fetched user list rather
 * than querying per keystroke. Fine at the scale of a marketplace's admin
 * panel; revisit with a real search action if the user base grows large
 * enough that shipping the full list becomes a problem.
 */
export function AdminUserPicker({ users, selectedUser, onSelect }: AdminUserPickerProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 8);
    return users.filter((u) => (u.full_name ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [users, query]);

  if (selectedUser) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#1B1F3B]/15 bg-white p-3">
        <SellerAvatar name={selectedUser.full_name} avatarUrl={selectedUser.avatar_url} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#1B1F3B]">
            {selectedUser.full_name || "Unnamed user"}
          </p>
          <p className="text-xs text-black/50">
            {selectedUser.whatsapp_number || "No WhatsApp number on file"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex items-center gap-1 rounded-full border border-[#1B1F3B]/15 px-3 py-1.5 text-xs font-medium text-[#1B1F3B] hover:bg-black/5"
        >
          <X className="size-3.5" />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-input bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-[#E8A33D]"
        />
      </div>

      {results.length > 0 ? (
        <div className="grid gap-1 rounded-lg border border-[#1B1F3B]/10 bg-white p-1">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              disabled={user.is_banned}
              onClick={() => onSelect(user)}
              className="flex items-center gap-3 rounded-md p-2 text-left transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SellerAvatar name={user.full_name} avatarUrl={user.avatar_url} size={32} />
              <div>
                <p className="text-sm font-medium text-[#1B1F3B]">
                  {user.full_name || "Unnamed user"}
                  {user.is_banned ? (
                    <span className="ml-2 text-xs font-normal text-destructive">Banned</span>
                  ) : null}
                </p>
                {user.whatsapp_number ? (
                  <p className="text-xs text-black/50">{user.whatsapp_number}</p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="px-1 text-sm text-black/50">No users match &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}
