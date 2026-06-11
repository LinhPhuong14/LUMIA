"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Input } from "@/components/ui/input";
import { getSubscriptionStatusLabel } from "@/lib/subscription-labels";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription?: { status: string; started_at: string | null; expires_at: string | null };
  streak?: { current_streak: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data: UserRow[]) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  return (
    <AdminPageShell title="Người dùng">
        <Input
          type="search"
          label="Tìm kiếm"
          placeholder="Tìm theo email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="mt-8 overflow-x-auto rounded-[20px] border border-white/70">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-warm">
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 pr-4">Email</th>
                <th className="px-4 py-3 pr-4">Tên</th>
                <th className="px-4 py-3 pr-4">Vai trò</th>
                <th className="px-4 py-3 pr-4">Gói</th>
                <th className="px-4 py-3 pr-4">Bắt đầu</th>
                <th className="px-4 py-3 pr-4">Kết thúc</th>
                <th className="px-4 py-3">Streak</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer border-t border-white/60 transition hover:bg-matcha-soft/30"
                  onClick={() => setSelected(user)}
                >
                  <td className="px-4 py-3 pr-4">{user.email}</td>
                  <td className="px-4 py-3 pr-4">{user.full_name || "—"}</td>
                  <td className="px-4 py-3 pr-4">{user.role}</td>
                  <td className="px-4 py-3 pr-4">{getSubscriptionStatusLabel(user.subscription?.status ?? "free")}</td>
                  <td className="px-4 py-3 pr-4">
                    {user.subscription?.started_at
                      ? new Date(user.subscription.started_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 pr-4">
                    {user.subscription?.expires_at
                      ? new Date(user.subscription.expires_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{user.streak?.current_streak ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
            <div className="soft-card h-full w-full max-w-md overflow-y-auto rounded-none p-6 shadow-xl">
              <h2 className="font-serif text-2xl text-matcha-deep">{selected.full_name || selected.email}</h2>
              <p className="mt-2 text-sm text-muted">{selected.email}</p>
              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Gói</dt>
                  <dd>{getSubscriptionStatusLabel(selected.subscription?.status ?? "free")}</dd>
                </div>
                <div>
                  <dt className="text-muted">Streak</dt>
                  <dd>{selected.streak?.current_streak ?? 0}</dd>
                </div>
              </dl>
              <button type="button" onClick={() => setSelected(null)} className="button-secondary mt-6">
                Đóng
              </button>
            </div>
          </div>
        ) : null}
    </AdminPageShell>
  );
}
