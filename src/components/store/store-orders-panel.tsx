"use client";

import { PackageOpen, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  canCancelOrder,
  getStoreOrderStatusLabel,
  storePaymentMethodLabels,
  type StoreOrderEntry,
  type StoreOrderStatus,
} from "@/lib/store-orders";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Màu theo nghĩa của trạng thái, không phải theo thứ tự — huỷ phải nhìn ra ngay. */
const STATUS_TONE: Record<StoreOrderStatus, string> = {
  pending_payment: "bg-amber-50 text-amber-700",
  paid: "bg-[var(--green-wash)] text-[var(--green-deep)]",
  preparing: "bg-[var(--green-wash)] text-[var(--green-deep)]",
  shipping: "bg-sky-50 text-sky-700",
  delivered: "bg-[var(--green-wash)] text-[var(--green-deep)]",
  cancelled: "bg-neutral-100 text-neutral-500",
};

export function StoreOrdersPanel({ orders: initial }: { orders: StoreOrderEntry[] }) {
  const [orders, setOrders] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cancel(orderId: string) {
    setBusyId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/store/orders/${orderId}/cancel`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: string; status?: string };
      if (!res.ok) {
        setError(body.error ?? "Không huỷ được đơn hàng.");
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "cancelled" as const, cancelledAt: new Date().toISOString() }
            : order,
        ),
      );
      setConfirmId(null);
    } catch {
      setError("Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.");
    } finally {
      setBusyId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] px-6 py-16 text-center">
        <PackageOpen className="h-12 w-12 text-[var(--muted)] opacity-40" />
        <p className="text-[14px] text-[var(--muted)]">Bạn chưa có đơn hàng nào.</p>
        <Link
          href="/store"
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" /> Khám phá cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</p>
      ) : null}

      {orders.map((order) => {
        const cancellable = canCancelOrder(order.status);
        return (
          <article
            key={order.id}
            className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)]"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                {/* Mã ngắn để khách đọc qua điện thoại cho shop — UUID đầy đủ thì
                    không ai đọc nổi, mà 8 ký tự đầu là đủ phân biệt. */}
                <p className="font-mono text-[12px] uppercase tracking-wider text-[var(--muted)]">
                  #{order.id.slice(0, 8)}
                </p>
                <p className="text-[12px] text-[var(--muted)]">{formatWhen(order.createdAt)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-medium ${STATUS_TONE[order.status] ?? "bg-neutral-100 text-neutral-500"}`}
              >
                {getStoreOrderStatusLabel(order.status)}
              </span>
            </header>

            <div className="space-y-1.5 px-5 py-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.product_id}__${item.variant ?? ""}__${index}`}
                  className="flex justify-between gap-4 text-[13px]"
                >
                  <span className="min-w-0 text-[var(--muted)]">
                    {item.name}
                    {item.variant ? ` (${item.variant})` : ""} × {item.qty}
                  </span>
                  <span className="shrink-0 text-[var(--foreground)]">
                    {formatVnd(item.price_vnd * item.qty)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-2.5 text-[13px] text-[var(--muted)]">
                <span>Phí ship</span>
                <span>{order.shippingVnd === 0 ? "Miễn phí" : formatVnd(order.shippingVnd)}</span>
              </div>
              <div className="flex justify-between gap-4 text-[14px] font-semibold text-[var(--foreground)]">
                <span>Tổng cộng</span>
                <span className="text-[var(--green-deep)]">{formatVnd(order.totalVnd)}</span>
              </div>
              <p className="pt-1 text-[12px] text-[var(--muted)]">
                {storePaymentMethodLabels[order.paymentMethod]}
              </p>
            </div>

            {order.shippingAddress ? (
              <div className="border-t border-[var(--border)] px-5 py-3 text-[12px] leading-relaxed text-[var(--muted)]">
                <span className="text-[var(--foreground)]">{order.shippingName}</span>
                {order.shippingPhone ? ` · ${order.shippingPhone}` : ""}
                <br />
                {order.shippingAddress}
              </div>
            ) : null}

            {cancellable ? (
              <footer className="border-t border-[var(--border)] px-5 py-3">
                {confirmId === order.id ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[13px] text-[var(--foreground)]">Huỷ đơn này?</span>
                    <button
                      type="button"
                      onClick={() => cancel(order.id)}
                      disabled={busyId === order.id}
                      className="rounded-full bg-red-500 px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {busyId === order.id ? "Đang huỷ…" : "Huỷ đơn"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      disabled={busyId === order.id}
                      className="text-[13px] text-[var(--muted)] underline-offset-2 hover:underline"
                    >
                      Giữ đơn
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConfirmId(order.id); setError(null); }}
                    className="text-[13px] font-medium text-red-500 underline-offset-2 hover:underline"
                  >
                    Huỷ đơn hàng
                  </button>
                )}
              </footer>
            ) : order.status === "shipping" ? (
              <footer className="border-t border-[var(--border)] px-5 py-3 text-[12px] text-[var(--muted)]">
                Đơn đang trên đường giao nên không tự huỷ được. Liên hệ shop nếu bạn cần hỗ trợ.
              </footer>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
