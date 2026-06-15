"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { TabPills } from "@/components/ui/tab-pills";
import { lumiaBoxes } from "@/data/catalog";
import {
  getPhysicalBoxStatusLabel,
  getPlanDisplayLabel,
  getSubscriptionStatusLabel,
} from "@/lib/subscription-labels";
import type { OrderEntry } from "@/lib/orders";
import { getOrderStatusLabel } from "@/lib/orders";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";
import { formatCurrency, formatDate } from "@/lib/utils";

type Tab = "box" | "orders" | "access";

const featureMatrix = [
  { name: "Mood check-in", free: true, active: true },
  { name: "Viết ra", free: true, active: true },
  { name: "Nhật ký + Mood tab", free: false, active: true },
  { name: "AI Chat", free: "3/ngày", active: "Không giới hạn" },
  { name: "Audio mẫu", free: true, active: true },
  { name: "Audio full + Breathing + Timer", free: false, active: true },
  { name: "Hành trình + Báo cáo", free: false, active: true },
  { name: "Streak", free: false, active: true },
];

const upsellSlugs = ["standard", "plus", "premium"] as const;

export function AccountPanel({
  subscription,
  orders: initialOrders,
}: {
  subscription: SubscriptionSnapshot;
  orders: OrderEntry[];
}) {
  const [tab, setTab] = useState<Tab>("box");
  const [orders, setOrders] = useState(initialOrders);

  const refreshOrders = useCallback(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data: OrderEntry[]) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const planName = subscription.tierName ?? getPlanDisplayLabel(subscription);
  const tierKey = subscription.isActive ? "active" : "free";
  return (
    <div className="space-y-6">
      <TabPills
        fullWidth
        className="lg:!inline-flex lg:!w-auto lg:rounded-full lg:border lg:border-[var(--border)] lg:bg-[var(--surface-card)] lg:p-1 lg:shadow-sm"
        tabs={[
          { id: "box", label: "Hộp của tôi" },
          { id: "orders", label: "Đơn hàng" },
          { id: "access", label: "Quyền của tôi" },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {tab === "box" ? (
        <section className="dash-panel p-6">
          <span className="eyebrow">Gói đang dùng</span>
          <h2 className="mt-4 font-sans text-xl font-medium text-matcha-text">{planName}</h2>
          <p className="mt-3 text-sm text-muted">Trạng thái: {getSubscriptionStatusLabel(subscription.status)}</p>

          {subscription.isActive && subscription.expiresAt ? (
            <>
              <p className="mt-4 text-sm text-matcha-deep">
                Đến ngày {formatDate(subscription.expiresAt)}
                {subscription.daysRemaining !== null ? ` (còn ${subscription.daysRemaining} ngày)` : ""}
              </p>
              {subscription.periodProgress !== null ? (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-matcha-soft/40">
                  <div
                    className="h-full bg-matcha"
                    style={{ width: `${subscription.periodProgress}%` }}
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {subscription.hasPhysicalBox ? (
            <div className="mt-8 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-medium text-matcha-deep">Hộp quà của bạn</p>
              <p className="mt-2 text-sm text-muted">
                {getPhysicalBoxStatusLabel(subscription.physicalBoxStatus)}
              </p>
              <p className="mt-2 text-[12px] text-muted">
                Truy cập app không phụ thuộc vào việc nhận hộp - bạn có thể dùng LUMIA ngay sau thanh toán.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!subscription.isActive ? (
              <Link href="/store" className="button-primary">
                {subscription.status === "expired" ? "Gia hạn gói" : "Xem các gói LUMIA"}
              </Link>
            ) : null}
          </div>

          {!subscription.isActive ? (
            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-matcha-deep">Gợi ý cho bạn</p>
              {lumiaBoxes
                .filter((box) => upsellSlugs.includes(box.slug as (typeof upsellSlugs)[number]))
                .map((box) => (
                  <Link
                    key={box.slug}
                    href={`/boxes/${box.slug}`}
                    className={`block rounded-[24px] border p-5 transition hover:bg-[var(--surface)] ${
                      box.featured
                        ? "border-matcha-highlight/80 bg-matcha-highlight-bg/50"
                        : "border-[var(--border)] bg-[var(--surface-card)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-matcha-deep">{box.name}</div>
                        <p className="mt-1 text-sm text-muted">{box.duration}</p>
                      </div>
                      <div className="text-right font-sans text-base font-medium text-matcha-text">
                        {formatCurrency(box.price)}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "orders" ? (
        <section className="dash-panel p-6">
          <span className="eyebrow">Lịch sử đơn hàng</span>
          {orders.length ? (
            <div className="mt-5 space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-medium text-matcha-deep">
                      {order.tierName ?? "LUMIA"}
                    </div>
                    <div className="text-[12px] text-muted">
                      {formatDate(order.createdAt)}
                      {order.durationMonths ? ` · ${order.durationMonths} tháng` : ""}
                    </div>
                  </div>
                  <div className="text-sm">{formatCurrency(order.amount)}</div>
                  <span className="rounded-full bg-matcha-soft/50 px-3 py-1 text-[12px] font-medium text-matcha-deep">
                    {getOrderStatusLabel(order.status)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Chưa có đơn hàng.</p>
          )}
        </section>
      ) : null}

      {tab === "access" ? (
        <section className="dash-panel p-6">
          <span className="eyebrow">Quyền của tôi</span>
          <p className="mt-2 text-sm text-muted">
            Gói hiện tại: <strong>{planName}</strong>
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="pb-3 pr-4">Tính năng</th>
                  <th className={`pb-3 pr-4 ${tierKey === "free" ? "font-semibold text-matcha-deep" : ""}`}>
                    Dùng thử
                  </th>
                  <th className={`pb-3 ${tierKey === "active" ? "font-semibold text-matcha-deep" : ""}`}>
                    Đang dùng
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row) => (
                  <tr key={row.name} className="border-t border-[var(--border)]">
                    <td className="py-3 pr-4 text-matcha-deep">{row.name}</td>
                    <td className="py-3 pr-4 text-muted">
                      {typeof row.free === "boolean" ? (row.free ? "✓" : "-") : row.free}
                    </td>
                    <td className="py-3 text-muted">
                      {typeof row.active === "boolean" ? (row.active ? "✓" : "-") : row.active}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
