import Link from "next/link";

import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: BoxProduct }) {
  const highlighted = product.featured;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[36px] border p-6 shadow-[0_20px_60px_rgba(180,154,67,0.08)]",
        highlighted
          ? "border-matcha-highlight/80 bg-matcha-highlight-bg/90 ring-1 ring-matcha-highlight/60"
          : "border-white/70 bg-white/78",
      )}
      style={{ backgroundImage: product.gradient }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-matcha-deep">{product.badge}</span>
          <h2 className="mt-4 font-serif text-2xl text-matcha-deep">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{product.duration}</p>
        </div>
        <div
          className="h-24 w-24 shrink-0 rounded-[24px] bg-gradient-to-br from-matcha-soft to-matcha opacity-90"
          aria-hidden
        />
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
        {product.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-matcha">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <div className="font-serif text-3xl text-matcha-deep">{formatCurrency(product.price)}</div>
          {product.priceNote ? (
            <p className="mt-1 text-sm text-muted">({product.priceNote})</p>
          ) : null}
        </div>
        <Link href={`/boxes/${product.slug}`} className="button-primary shrink-0">
          {product.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
