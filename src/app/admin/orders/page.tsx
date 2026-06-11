"use client";

import { useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getProductTier, isValidTierCode } from "@/lib/product-tiers";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  tier?: string | null;
  duration_months?: number | null;
  has_physical_box?: boolean;
  profiles?: { full_name?: string; email?: string };
};

const statuses = ["paid", "preparing", "shipping", "delivered"] as const;

function getTierLabel(tier: string | null | undefined) {
  if (!tier || !isValidTierCode(tier)) {
    return "—";
  }
  return getProductTier(tier).name;
}

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

  const statusLabels: Record<string, string> = {
    paid: "Đã thanh toán",
    preparing: "Đang chuẩn bị",
    shipping: "Đang giao",
    delivered: "Đã giao",
  };

  return (
    <AdminPageShell title="Quản lý đơn hàng">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-[20px] border border-matcha-soft bg-surface-glass px-4 py-3 text-sm"
        >
          <option value="all">Tất cả</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s] ?? s}
            </option>
          ))}
        </select>

        <div className="admin-table-wrapper mt-8 rounded-[20px] border border-white/70">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-surface-warm">
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 pr-4">Mã đơn</th>
                <th className="px-4 py-3 pr-4">Email</th>
                <th className="px-4 py-3 pr-4">Gói</th>
                <th className="px-4 py-3 pr-4">Thời hạn</th>
                <th className="px-4 py-3 pr-4">Có box?</th>
                <th className="px-4 py-3 pr-4">Ngày đặt</th>
                <th className="px-4 py-3 pr-4">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-white/60 transition hover:bg-matcha-soft/30">
                  <td className="px-4 py-3 pr-4 font-mono text-[12px]">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 pr-4">{order.profiles?.email ?? "—"}</td>
                  <td className="px-4 py-3 pr-4">{getTierLabel(order.tier)}</td>
                  <td className="px-4 py-3 pr-4">
                    {order.duration_months ? `${order.duration_months} tháng` : "—"}
                  </td>
                  <td className="px-4 py-3 pr-4">{order.has_physical_box ? "Có" : "Không"}</td>
                  <td className="px-4 py-3 pr-4">{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 pr-4">{formatCurrency(order.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-[12px] border border-matcha-soft bg-white px-2 py-1 text-xs"
                      disabled={!order.has_physical_box && order.status === "paid"}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toast ? (
          <p className="mt-4 text-sm text-matcha-deep">{toast}</p>
        ) : null}
    </AdminPageShell>
  );
}
