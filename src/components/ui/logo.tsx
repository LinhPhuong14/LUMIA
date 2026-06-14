import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function LumiaLogo({
  className,
  variant = "dark",
  compact = false,
}: {
  className?: string;
  /** dark = dark ink for light UI; light = cream wordmark for dark UI */
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  const src =
    variant === "light" ? "/brand/lumia-logo-light.png" : "/brand/lumia-logo-dark.png";

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="LUMIA"
        width={260}
        height={116}
        className={cn(
          compact ? "h-[26px] w-auto md:h-[29px]" : "h-auto w-[126px] md:w-[148px]",
        )}
        priority
      />
    </Link>
  );
}
