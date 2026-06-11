"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

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

  async function createPaymentLink() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout/create-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: product.tier, slug: product.slug }),
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
      <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--lumia-text)]">
        {product.name}
      </h3>
      <p className="mt-2 text-sm text-[var(--lumia-text-soft)]">{product.duration}</p>

      <div className="mt-5 rounded-[28px] bg-[var(--lumia-green-bg)] p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">Tổng thanh toán</div>
        <div className="price-amount mt-2">{formatCurrency(product.price)}</div>
        {product.priceNote ? (
          <p className="price-per-month mt-1">({product.priceNote})</p>
        ) : null}
      </div>

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
