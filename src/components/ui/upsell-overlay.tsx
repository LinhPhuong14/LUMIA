import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";

export function UpsellOverlay({
  featureName,
  description,
  children,
  locked = true,
  variant = "section",
}: {
  featureName: string;
  description?: string;
  children?: ReactNode;
  locked?: boolean;
  variant?: "card" | "banner" | "section";
}) {
  if (!locked) {
    return <>{children}</>;
  }

  if (variant === "banner") {
    return (
      <div className="dash-panel flex flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne shadow-[0_8px_20px_rgba(244,216,120,0.18)]">
            <Lock className="h-4 w-4 text-matcha-deep" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sans text-sm font-semibold text-matcha-text sm:text-base">
              {featureName} - LUMIA Premium
            </h3>
            {description ? (
              <p className="mt-1 text-[12px] leading-relaxed text-muted sm:text-[13px]">{description}</p>
            ) : (
              <p className="mt-1 text-[12px] text-muted sm:text-[13px]">Mở khóa để dùng đầy đủ tính năng.</p>
            )}
          </div>
        </div>
        <Link href="/store" className="button-primary shrink-0 self-start text-[13px] sm:self-center">
          Xem các gói LUMIA
        </Link>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
        <div className="pointer-events-none h-full select-none opacity-45 blur-[1px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-white/55 p-3 backdrop-blur-[4px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne shadow-sm">
            <Lock className="h-4 w-4 text-matcha-deep" />
          </div>
          <p className="max-w-[140px] text-center text-[11px] font-medium leading-snug text-matcha-text">
            {featureName}
          </p>
          <Link
            href="/store"
            className="rounded-full bg-[var(--green)] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm"
          >
            Mở khóa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 sm:min-h-[160px]">
      <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/55 p-4 backdrop-blur-md sm:p-6">
        <div className="mx-auto w-full max-w-sm px-2 text-center sm:px-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-champagne shadow-[0_12px_28px_rgba(244,216,120,0.2)] sm:h-12 sm:w-12">
            <Lock className="h-5 w-5 text-matcha-deep" />
          </div>
          <h3 className="mt-3 font-sans text-sm font-medium text-matcha-text sm:mt-4 sm:text-base">
            {featureName} dành cho thành viên LUMIA Premium
          </h3>
          {description ? <p className="mt-2 text-[12px] leading-6 text-muted sm:text-[13px]">{description}</p> : null}
          <Link href="/store" className="button-primary mt-4 inline-flex text-[13px] sm:mt-5">
            Xem các gói LUMIA
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PremiumSectionTeaser({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return <UpsellOverlay featureName={title} description={description} variant="banner" locked />;
}
