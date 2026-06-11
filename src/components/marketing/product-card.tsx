import Image from "next/image";
import Link from "next/link";

import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product, featured = false }: { product: BoxProduct; featured?: boolean }) {
  return (
    <article
      className={`relative overflow-hidden rounded-[36px] border border-white/70 p-6 shadow-[0_20px_60px_rgba(180,154,67,0.08)] ${
        featured ? "bg-white/90" : "bg-white/78"
      }`}
      style={{ backgroundImage: product.gradient }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-matcha-deep">{product.badge}</span>
          <h2 className="mt-4 font-serif text-3xl text-matcha-deep">{product.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{product.tagline}</p>
        </div>
        <Image src="/assets/boxes-editorial.svg" alt="" width={120} height={120} className="opacity-80" />
      </div>

      <p className="mt-5 text-sm leading-7 text-foreground">{product.description}</p>

      <ul className="mt-5 space-y-2 text-sm text-muted">
        {product.features.slice(0, 4).map((feature) => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="font-serif text-3xl text-matcha-deep">{formatCurrency(product.price)}</div>
        <Link href={`/boxes/${product.slug}`} className="button-primary">
          {product.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
