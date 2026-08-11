"use client";

import { useEffect, useState } from "react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  storeOrderStatusLabels,
  storePaymentMethodLabels,
  type StoreOrderEntry,
} from "@/lib/store-orders";
import { formatCurrency } from "@/lib/utils";

type AdminStoreOrder = StoreOrderEntry & {
  customerName: string | null;
  customerEmail: string | null;
};

/** Bước admin thao tác được. `pending_payment` không có vì cửa hàng chỉ có COD. */
const STATUSES = ["preparing", "shipping", "delivered", "cancelled"] as const;

export function StoreOrdersTable() {
  const [orders, setOrders] = useState<AdminStoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/store/orders")
      .then((r) => r.json())
      .then((data: { orders?: AdminStoreOrder[] }) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    const previous = orders.find((o) => o.id === id)?.status;
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status: status as StoreOrderEntry["status"] } : o)),
    );

    try {
      const res = await fetch(`/api/admin/store/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("failed");
      setToast("Đã cập nhật trạng thái");
    } catch {
      // Trả lại giá trị cũ: để nguyên giá trị mới trên màn hình sau khi ghi hỏng
      // là nói dối admin về trạng thái thật của đơn.
      if (previous) {
        setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: previous } : o)));
      }
      setToast("Cập nhật thất bại");
    }
    window.setTimeout(() => setToast(null), 2000);
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <p className="mt-6 text-sm text-muted">Đang tải đơn cửa hàng…</p>;
  }

  return (
    <>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="rounded-[20px] border border-matcha-soft bg-surface-glass px-4 py-3 text-sm"
      >
        <option value="all">Tất cả</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {storeOrderStatusLabels[s]}
          </option>
        ))}
      </select>

      <div className="admin-table-wrapper mt-8 rounded-[20px] border border-white/70">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-surface-warm">
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 pr-4">Mã đơn</th>
              <th className="px-4 py-3 pr-4">Khách</th>
              <th className="px-4 py-3 pr-4">Sản phẩm</th>
              <th className="px-4 py-3 pr-4">Giao tới</th>
              <th className="px-4 py-3 pr-4">Ngày đặt</th>
              <th className="px-4 py-3 pr-4">Thanh toán</th>
              <th className="px-4 py-3 pr-4">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-t border-white/60 align-top transition hover:bg-matcha-soft/30">
                <td className="px-4 py-3 pr-4 font-sans text-[12px] tabular-nums">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 pr-4">
                  <div>{order.customerName ?? order.shippingName ?? "-"}</div>
                  <div className="text-[12px] text-muted">{order.customerEmail ?? "-"}</div>
                </td>
                <td className="px-4 py-3 pr-4">
                  {order.items.map((item, index) => (
                    <div key={`${item.product_id}__${index}`} className="text-[12px]">
                      {item.name}
                      {item.variant ? ` (${item.variant})` : ""} × {item.qty}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 pr-4 text-[12px]">
                  <div>{order.shippingPhone ?? "-"}</div>
                  <div className="text-muted">{order.shippingAddress ?? "-"}</div>
                  {order.note ? <div className="text-muted">Ghi chú: {order.note}</div> : null}
                </td>
                <td className="px-4 py-3 pr-4">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 pr-4 text-[12px]">
                  {storePaymentMethodLabels[order.paymentMethod]}
                </td>
                <td className="px-4 py-3 pr-4">{formatCurrency(order.totalVnd)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-[12px] border border-matcha-soft bg-white px-2 py-1 text-xs"
                    >
                      {/* Đơn khách đã tự huỷ vẫn hiện đúng trạng thái của nó,
                          nhưng không nằm trong danh sách chuyển tiếp bình thường. */}
                      {(STATUSES as readonly string[]).includes(order.status)
                        ? null
                        : <option value={order.status}>{storeOrderStatusLabels[order.status]}</option>}
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {storeOrderStatusLabels[s]}
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

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Chưa có đơn cửa hàng nào.</p>
      ) : null}

      {toast ? <p className="mt-4 text-sm text-matcha-deep">{toast}</p> : null}
    </>
  );
}
