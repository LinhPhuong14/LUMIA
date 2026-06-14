import Link from "next/link";
import { Check } from "lucide-react";

import type { LandingBoxCard } from "@/components/landing/data/landing-content";
import { cn } from "@/lib/utils";

const HIGHLIGHT_SLUG = "pro";

export function LandingPricingTier({ box }: { box: LandingBoxCard }) {
  const highlighted = box.slug === HIGHLIGHT_SLUG;

  return (
    <article
      className={cn(
        "landing-pricing-tier flex h-full min-h-0 flex-col rounded-[20px] border md:rounded-[24px]",
        highlighted && "landing-pricing-tier--highlighted",
      )}
    >
      {box.badge ? (
        <span className="landing-pricing-tier__badge inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] md:px-2.5 md:py-1 md:text-[10px]">
          {highlighted ? "Đề xuất" : box.badge}
        </span>
      ) : (
        <span className="landing-pricing-tier__badge-spacer" aria-hidden />
      )}

      <h3 className="landing-pricing-tier__title font-serif font-bold leading-tight tracking-[-0.02em]">
        {box.name}
      </h3>
      <p className="landing-pricing-tier__tagline mt-0.5 font-medium leading-snug">{box.tagline}</p>

      <div className="landing-pricing-tier__price-row mt-3 flex items-end gap-1 border-b pb-3 md:mt-4 md:pb-4">
        <span className="landing-pricing-tier__price font-serif font-semibold leading-none">{box.price}</span>
        <span className="landing-pricing-tier__per pb-0.5">/ {box.per}</span>
      </div>

      <ul className="mt-3 flex min-h-0 flex-1 flex-col justify-start space-y-1.5 md:mt-4 md:space-y-2">
        {box.features.slice(0, 4).map((feature) => (
          <li key={feature} className="landing-pricing-tier__feature flex items-start gap-1.5 leading-snug md:gap-2">
            <Check className="landing-pricing-tier__check mt-0.5 h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/boxes/${box.slug}`}
        className={cn(
          "landing-pricing-tier__cta mt-4 flex w-full items-center justify-center rounded-full py-2.5 text-[11px] font-semibold transition md:mt-5 md:py-3 md:text-[13px]",
          highlighted ? "button-primary" : "button-secondary",
        )}
      >
        Chọn gói
      </Link>
    </article>
  );
}
