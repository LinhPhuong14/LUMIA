"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data: UserRow[]) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <main className="shell py-14">
      <h1 className="font-serif text-4xl text-matcha-deep">Người dùng</h1>
      <div className="mt-8 space-y-3">
        {users.map((user) => (
          <article key={user.id} className="soft-card p-5">
            <div className="font-medium">{user.full_name || user.email}</div>
            <div className="text-sm text-muted">
              {user.subscription?.status ?? "free"} · Streak: {user.streak?.current_streak ?? 0}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
