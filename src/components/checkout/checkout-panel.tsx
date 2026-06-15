"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

type ShippingForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  note: string;
};

export function CheckoutPanel({
  product,
  unavailable = false,
  unavailableReason,
}: {
  product: BoxProduct;
  unavailable?: boolean;
  unavailableReason?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const needsShipping = product.physicalItems.length > 0;
  const [shipping, setShipping] = useState<ShippingForm>({
    name: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });

  function updateShipping(field: keyof ShippingForm, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function validateShipping(): string | null {
    if (!needsShipping) return null;
    if (!shipping.name.trim()) return "Vui lòng nhập họ tên người nhận.";
    if (!shipping.phone.trim()) return "Vui lòng nhập số điện thoại.";
    if (!/^(0|\+84)\d{8,10}$/.test(shipping.phone.replace(/\s/g, "")))
      return "Số điện thoại không hợp lệ (ví dụ: 0912345678).";
    if (!shipping.address.trim()) return "Vui lòng nhập địa chỉ giao hàng.";
    if (!shipping.city.trim()) return "Vui lòng nhập thành phố / tỉnh.";
    return null;
  }

  function handleReviewOrder() {
    const shippingError = validateShipping();
    if (shippingError) {
      setError(shippingError);
      return;
    }
    setError(null);
    setShowConfirm(true);
  }

  async function confirmAndPay() {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout/create-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier: product.tier,
        slug: product.slug,
        shipping: needsShipping ? shipping : undefined,
      }),
    });

    const result = (await response.json()) as { checkoutUrl?: string; error?: string };

    if (!response.ok || !result.checkoutUrl) {
      setError(result.error ?? "Không thể khởi tạo bước thanh toán lúc này.");
      setLoading(false);
      return;
    }

    window.location.href = result.checkoutUrl;
  }

  return (
    <>
      {/* Confirmation modal */}
      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-t-[28px] bg-[var(--surface-card)] p-6 shadow-2xl sm:rounded-[28px]">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--surface)]"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Xác nhận đơn hàng
            </p>
            <h3 className="mt-2 font-serif text-xl text-[var(--foreground)]">{product.name}</h3>

            <div className="mt-4 space-y-2 rounded-[18px] bg-[var(--surface)] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Gói</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Thời hạn</span>
                <span>{product.duration}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <span className="font-semibold">Tổng cộng</span>
                <span className="font-bold text-[var(--green-deep)]">{formatCurrency(product.price)}</span>
              </div>
            </div>

            {needsShipping && shipping.name ? (
              <div className="mt-3 rounded-[18px] bg-[var(--surface)] p-4 text-sm">
                <p className="mb-1 text-[var(--muted)]">Giao tới</p>
                <p className="font-semibold">{shipping.name} · {shipping.phone}</p>
                <p className="text-[var(--muted)]">{shipping.address}, {shipping.city}</p>
                {shipping.note ? <p className="text-[var(--muted)]">Ghi chú: {shipping.note}</p> : null}
              </div>
            ) : null}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="button-secondary flex-1"
              >
                Chỉnh sửa
              </button>
              <Button type="button" onClick={confirmAndPay} className="flex-1 justify-center">
                Xác nhận thanh toán
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="product-card product-card-default w-full max-w-md p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">
          Hoàn tất lựa chọn của bạn
        </div>
        <h3 className="mt-4 font-serif text-xl font-bold text-[var(--title-primary)]">{product.name}</h3>
        <p className="mt-2 text-sm text-[var(--lumia-text-soft)]">{product.duration}</p>

        <div className="mt-5 rounded-[28px] bg-[var(--lumia-green-bg)] p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">Tổng thanh toán</div>
          <div className="price-amount mt-2">{formatCurrency(product.price)}</div>
          {product.priceNote ? <p className="price-per-month mt-1">({product.priceNote})</p> : null}
          {product.savingsNote ? (
            <p className="mt-1 text-sm font-semibold text-[var(--lumia-green)]">{product.savingsNote}</p>
          ) : null}
        </div>

        {needsShipping ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-[var(--title-primary)]">
              Thông tin nhận hàng vật lý
            </p>
            <label className="block">
              <span className="sr-only">Họ tên người nhận</span>
              <input
                value={shipping.name}
                onChange={(e) => updateShipping("name", e.target.value)}
                placeholder="Họ tên người nhận *"
                required
                aria-label="Họ tên người nhận"
                className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
              />
            </label>
            <label className="block">
              <span className="sr-only">Số điện thoại</span>
              <input
                value={shipping.phone}
                onChange={(e) => updateShipping("phone", e.target.value)}
                placeholder="Số điện thoại * (ví dụ: 0912345678)"
                type="tel"
                required
                aria-label="Số điện thoại"
                className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
              />
            </label>
            <label className="block">
              <span className="sr-only">Địa chỉ chi tiết</span>
              <input
                value={shipping.address}
                onChange={(e) => updateShipping("address", e.target.value)}
                placeholder="Địa chỉ chi tiết *"
                required
                aria-label="Địa chỉ chi tiết"
                className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
              />
            </label>
            <label className="block">
              <span className="sr-only">Thành phố / Tỉnh</span>
              <input
                value={shipping.city}
                onChange={(e) => updateShipping("city", e.target.value)}
                placeholder="Thành phố / Tỉnh *"
                required
                aria-label="Thành phố / Tỉnh"
                className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
              />
            </label>
            <label className="block">
              <span className="sr-only">Ghi chú giao hàng</span>
              <input
                value={shipping.note}
                onChange={(e) => updateShipping("note", e.target.value)}
                placeholder="Ghi chú giao hàng (tuỳ chọn)"
                aria-label="Ghi chú giao hàng"
                className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
              />
            </label>
          </div>
        ) : null}

        {unavailable ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-[var(--lumia-text-mid)]">
              {unavailableReason ?? "Bạn đã sử dụng ưu đãi này rồi."}
            </p>
            <Link href="/boxes/standard" className="button-primary inline-flex w-full justify-center">
              Xem gói STANDARD
            </Link>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handleReviewOrder}
            disabled={loading}
            className="mt-6 w-full justify-center"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Đang chuyển sang PayOS...
              </>
            ) : (
              "Xem lại & Thanh toán"
            )}
          </Button>
        )}

        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
      </div>
    </>
  );
}
