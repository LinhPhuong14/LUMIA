import { cn } from "@/lib/utils";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";

const variantClasses: Record<PlanBadgeVariant, string> = {
  free: "border-matcha-soft bg-surface-warm text-muted",
  active: "border-matcha-soft bg-matcha-soft text-matcha-text",
  expired: "border-error-soft bg-error-soft text-error",
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
        "inline-flex max-w-[12rem] truncate rounded-full border px-3.5 py-2 font-sans text-[13px] font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
