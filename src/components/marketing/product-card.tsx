import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { ProductDefinition } from "@/types/domain";
import { cn, formatCurrency } from "@/lib/utils";

export function ProductCard({ product, featured = false }: { product: ProductDefinition; featured?: boolean }) {
  return (
    <article
      className={cn(
        "soft-card group flex h-full flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_80px_rgba(244,216,120,0.22)]",
        featured && "border-champagne/80",
      )}
    >
      <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-4">
        <Image
          src="/assets/boxes-editorial.svg"
          alt={product.name}
          width={1200}
          height={900}
          className="h-56 w-full rounded-[22px] object-cover transition duration-500 group-hover:scale-[1.03] group-hover:rotate-[0.8deg]"
        />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow border-white/70 bg-white/82 text-matcha-deep">{product.tierLabel}</span>
          <h3 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">{product.name}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{product.tagline}</p>
        </div>
        {product.badge ? (
          <div className="rounded-full bg-[#FFF3C7] px-3 py-2 text-xs font-semibold text-matcha-deep">{product.badge}</div>
        ) : null}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/70 bg-white/76 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Mức đầu tư</div>
        <div className="mt-2 text-3xl font-semibold text-foreground">{formatCurrency(product.price)}</div>
        <p className="mt-2 text-sm leading-6 text-muted">{product.digitalAccess}</p>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-3 text-sm leading-6 text-foreground">
        {product.features.slice(0, 4).map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-matcha" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.24em] text-muted">{product.durationMonths} tháng đồng hành</span>
        <Link href={`/boxes/${product.slug}` as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-matcha-deep">
          {product.ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
