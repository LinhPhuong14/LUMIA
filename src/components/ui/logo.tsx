import Link from "next/link";

import { cn } from "@/lib/utils";

export function LumiaLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(145deg,#FFFEFA,#FFF3C7)] shadow-[0_12px_36px_rgba(244,216,120,0.22)]">
        <span className="font-serif text-xl tracking-[-0.04em] text-matcha-deep">L</span>
      </div>
      <div>
        <div className="font-serif text-[1.35rem] tracking-[0.18em] text-matcha-deep">LUMIA</div>
        
      </div>
    </Link>
  );
}
