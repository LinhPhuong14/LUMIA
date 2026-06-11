import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";

export function UpsellOverlay({
  featureName,
  description,
  children,
  locked = true,
}: {
  featureName: string;
  description?: string;
  children: ReactNode;
  locked?: boolean;
}) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[200px]">
      <div className="pointer-events-none select-none blur-[2px] opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/55 backdrop-blur-md">
        <div className="mx-auto max-w-sm px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-champagne shadow-[0_12px_28px_rgba(244,216,120,0.2)]">
            <Lock className="h-5 w-5 text-matcha-deep" />
          </div>
          <h3 className="mt-4 font-serif text-xl text-matcha-deep">
            {featureName} dành cho người có hộp LUMIA
          </h3>
          {description ? <p className="mt-2 text-[13px] leading-6 text-muted">{description}</p> : null}
          <Link href="/boxes" className="button-primary mt-5 inline-flex">
            Khám phá hộp LUMIA
          </Link>
        </div>
      </div>
    </div>
  );
}
