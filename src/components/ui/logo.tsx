import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function LumiaLogo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const src =
    variant === "light"
      ? "/brand/lumia-logo-light.png"
      : "/brand/lumia-logo-dark.png";

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="LUMIA"
        width={260}
        height={116}
        className="h-auto w-[126px] md:w-[148px]"
        priority
      />
    </Link>
  );
}
