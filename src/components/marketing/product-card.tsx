import Link from "next/link";

import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  unavailable = false,
  unavailableReason,
}: {
  product: BoxProduct;
  unavailable?: boolean;
  unavailableReason?: string;
}) {
  const highlighted = product.featured;

  return (
    <article
      className={cn(
        "product-card relative flex h-full flex-col rounded-[28px] border p-6",
        highlighted ? "product-card-featured" : "product-card-default",
      )}
    >
      {highlighted ? (
        <span className="badge-featured mb-4 inline-flex w-fit">GÓI TIẾT KIỆM</span>
      ) : null}

      <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--lumia-text)]">
        {product.name}
      </h2>

      <div className="my-4 h-px bg-[var(--lumia-green-soft)]" />

      <p className="text-base text-[var(--lumia-text-soft)]">{product.duration}</p>

      <div className="mt-4">
        <div className="price-amount">{formatCurrency(product.price)}</div>
        {product.priceNote ? (
          <p className="price-per-month mt-1">({product.priceNote})</p>
        ) : null}
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm leading-relaxed text-[var(--lumia-text-mid)]">
        {product.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="feature-check">✓</span>
            <span>{feature}</span>
          </li>
        ))}
        {product.physicalItems.map((item) => (
          <li key={item} className="flex gap-2 font-semibold">
            <span className="feature-check">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {unavailable ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full border border-[var(--lumia-green-soft)] bg-white/60 px-5 py-3 text-sm font-medium text-[var(--lumia-text-soft)]"
              title={unavailableReason}
            >
              Đã sử dụng ưu đãi
            </button>
            {unavailableReason ? (
              <p className="mt-2 text-center text-xs text-[var(--lumia-text-soft)]">{unavailableReason}</p>
            ) : null}
          </div>
        ) : (
          <Link
            href={`/boxes/${product.slug}`}
            className="button-primary flex w-full justify-center text-center"
          >
            {product.ctaLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
