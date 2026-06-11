"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { formatCurrency } from "@/lib/utils";

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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  async function updateStatus(id: string, status: string) {
    const prev = orders.find((o) => o.id === id)?.status;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));

    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok && prev) {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: prev } : o)));
      setToast("Cập nhật thất bại");
    } else {
      setToast("Đã cập nhật trạng thái");
    }
    window.setTimeout(() => setToast(null), 2000);
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen">
      <main className="shell py-14">
        <Link href="/admin" className="text-sm text-muted hover:text-matcha-deep">
          ← Quản trị
        </Link>
        <h1 className="font-serif text-4xl text-matcha-deep">Quản lý đơn hàng</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-6 rounded-xl border px-3 py-2"
        >
          <option value="all">Tất cả</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Ngày đặt</th>
                <th className="pb-3 pr-4">Số tiền</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-white/60">
                  <td className="py-3 pr-4 font-mono text-[12px]">{order.id.slice(0, 8)}</td>
                  <td className="py-3 pr-4">{order.profiles?.email ?? "—"}</td>
                  <td className="py-3 pr-4">{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="py-3 pr-4">{formatCurrency(order.amount)}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-xl border px-2 py-1"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {toast ? <p className="mt-4 text-sm text-matcha-deep">{toast}</p> : null}
      </main>
    </div>
  );
}
