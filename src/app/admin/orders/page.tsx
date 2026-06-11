"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  profiles?: { full_name?: string; email?: string };
};

const statuses = ["paid", "preparing", "shipping", "delivered"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <main className="shell py-14">
      <h1 className="font-serif text-4xl text-matcha-deep">Quản lý đơn hàng</h1>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => setFilter("all")} className="button-secondary">
          Tất cả
        </button>
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className="button-secondary">
            {s}
          </button>
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {filtered.map((order) => (
          <article key={order.id} className="soft-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <div className="font-medium">{order.profiles?.full_name ?? order.profiles?.email}</div>
              <div className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString("vi-VN")}</div>
            </div>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order.id, e.target.value)}
              className="rounded-xl border px-3 py-2"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </article>
        ))}
      </div>
    </main>
  );
}
