"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

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
    if (!shipping.address.trim()) return "Vui lòng nhập địa chỉ giao hàng.";
    if (!shipping.city.trim()) return "Vui lòng nhập thành phố / tỉnh.";
    return null;
  }

  async function createPaymentLink() {
    const shippingError = validateShipping();
    if (shippingError) {
      setError(shippingError);
      return;
    }

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
          <input
            value={shipping.name}
            onChange={(e) => updateShipping("name", e.target.value)}
            placeholder="Họ tên người nhận *"
            className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
          />
          <input
            value={shipping.phone}
            onChange={(e) => updateShipping("phone", e.target.value)}
            placeholder="Số điện thoại *"
            className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
          />
          <input
            value={shipping.address}
            onChange={(e) => updateShipping("address", e.target.value)}
            placeholder="Địa chỉ chi tiết *"
            className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
          />
          <input
            value={shipping.city}
            onChange={(e) => updateShipping("city", e.target.value)}
            placeholder="Thành phố / Tỉnh *"
            className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
          />
          <input
            value={shipping.note}
            onChange={(e) => updateShipping("note", e.target.value)}
            placeholder="Ghi chú giao hàng (tuỳ chọn)"
            className="w-full rounded-[18px] border border-[var(--lumia-green-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--lumia-green)]"
          />
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
          onClick={createPaymentLink}
          disabled={loading}
          className="mt-6 w-full justify-center"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Đang chuyển sang PayOS...
            </>
          ) : (
            "Thanh toán với PayOS"
          )}
        </Button>
      )}

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
    </div>
  );
}
