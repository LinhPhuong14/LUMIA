"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import type { ProductDefinition } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

export function CheckoutPanel({ product }: { product: ProductDefinition }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createPaymentLink() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout/create-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug: product.slug }),
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
    <div className="soft-card w-full max-w-md p-6">
      <div className="eyebrow">Hoàn tất lựa chọn của bạn</div>
      <h3 className="mt-4 font-serif text-3xl text-matcha-deep">{product.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{product.description}</p>

      <div className="mt-5 rounded-[28px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.92),rgba(255,243,199,0.48))] p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted">Mức đầu tư hôm nay</div>
        <div className="mt-2 text-3xl font-semibold text-matcha-deep">{formatCurrency(product.price)}</div>
        <p className="mt-2 text-sm leading-6 text-muted">
          Bao gồm chiếc hộp vật lý và quyền mở không gian số đi kèm với gói bạn đã chọn.
        </p>
      </div>

      <ul className="mt-5 flex flex-col gap-3 text-sm leading-6 text-foreground">
        {product.features.map((feature) => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>

      <button onClick={createPaymentLink} disabled={loading} className="button-primary mt-6 w-full disabled:opacity-60">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {loading ? " Đang đưa bạn sang bước thanh toán..." : "Tiếp tục thanh toán"}
      </button>

      <p className="mt-3 text-xs leading-5 text-muted">
        LUMIA sẽ chỉ mở quyền truy cập sau khi bước thanh toán được xác nhận thành công.
      </p>
      {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
    </div>
  );
}
