"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

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
    <div className="min-h-screen">
      <main className="shell py-14">
        <Link href="/admin" className="text-sm text-muted hover:text-matcha-deep">
          ← Quản trị
        </Link>
        <h1 className="font-serif text-4xl text-matcha-deep">Người dùng</h1>
        <input
          type="search"
          placeholder="Tìm theo email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-6 w-full max-w-md rounded-xl border px-4 py-2"
        />

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Tên</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Subscription</th>
                <th className="pb-3 pr-4">Started</th>
                <th className="pb-3 pr-4">Expires</th>
                <th className="pb-3">Streak</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer border-t border-white/60 hover:bg-white/50"
                  onClick={() => setSelected(user)}
                >
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4">{user.full_name || "—"}</td>
                  <td className="py-3 pr-4">{user.role}</td>
                  <td className="py-3 pr-4">{user.subscription?.status ?? "free"}</td>
                  <td className="py-3 pr-4">
                    {user.subscription?.started_at
                      ? new Date(user.subscription.started_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {user.subscription?.expires_at
                      ? new Date(user.subscription.expires_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="py-3">{user.streak?.current_streak ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
            <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
              <h2 className="font-serif text-2xl text-matcha-deep">{selected.full_name || selected.email}</h2>
              <p className="mt-2 text-sm text-muted">{selected.email}</p>
              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Subscription</dt>
                  <dd>{selected.subscription?.status ?? "free"}</dd>
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
      </main>
    </div>
  );
}
