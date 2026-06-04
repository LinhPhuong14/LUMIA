import type { Route } from "next";
import Link from "next/link";

import type { ProductDefinition } from "@/types/domain";
import { cn, formatCurrency } from "@/lib/utils";

export function ProductCard({ product, featured = false }: { product: ProductDefinition; featured?: boolean }) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e9e3d6] bg-white/88 shadow-[0_18px_48px_rgba(106,134,88,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(180,154,67,0.16)]",
        featured && "border-[#d8c786]",
      )}
    >
      <div className="relative rounded-t-[30px] bg-[linear-gradient(145deg,#d9ccb7,#efe7d9,#ddd5c8)] px-6 py-6">
        <div className="rounded-[24px] border border-white/45 bg-white/18 px-4 py-20 text-center text-sm text-white/88 backdrop-blur-sm">
          Ảnh box sẽ được cập nhật sau
        </div>
        {product.badge ? (
          <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#8f6a67] shadow-sm">
            {product.badge}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-[#8b847a]">{product.tierLabel}</div>
        <h3 className="mt-3 font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[#3e3a33]">{product.name}</h3>
        <p className="mt-3 text-sm leading-6 text-[#6f6b63]">{product.tagline}</p>
        <div className="mt-5 text-[1.6rem] font-semibold text-[#2f2b25]">{formatCurrency(product.price)}</div>
        <p className="mt-3 text-sm leading-6 text-[#6f6b63]">{product.digitalAccess}</p>

        <div className="mt-6 space-y-2">
          {product.features.slice(0, 3).map((feature) => (
            <div key={feature} className="text-sm leading-6 text-[#5f7253]">
              · {feature}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/boxes/${product.slug}` as Route}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#dcd3c1] bg-white px-5 py-3 text-sm font-medium text-[#2f2b25] transition hover:bg-[#faf7ef]"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
