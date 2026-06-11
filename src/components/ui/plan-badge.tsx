import { cn } from "@/lib/utils";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";

const variantClasses: Record<PlanBadgeVariant, string> = {
  free: "border-honey/40 bg-champagne/50 text-honey-dark",
  active: "border-matcha-soft bg-matcha-soft/80 text-matcha-deep",
  expired: "border-border bg-white/60 text-muted",
};

export function PlanBadge({
  label,
  variant,
  className,
}: {
  label: string;
  variant: PlanBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[12rem] truncate rounded-full border px-3.5 py-2 text-[13px] font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
