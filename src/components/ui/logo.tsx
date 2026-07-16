import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function LumiaLogo({
  className,
  variant = "dark",
  compact = false,
  href = "/",
}: {
  className?: string;
  /** dark = dark ink for light UI; light = cream wordmark for dark UI */
  variant?: "dark" | "light";
  compact?: boolean;
  /** Where the logo links to. Landing/marketing use "/"; the dashboard passes "/dashboard". */
  href?: Route;
}) {
  const src =
    variant === "light" ? "/brand/lumia-logo-light.png" : "/brand/lumia-logo-dark.png";

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="LUMIA"
        width={260}
        height={116}
        className={cn(
          compact ? "h-[32px] w-auto md:h-[36px]" : "h-[38px] w-auto md:h-[44px]",
        )}
        priority
      />
    </Link>
  );
}
