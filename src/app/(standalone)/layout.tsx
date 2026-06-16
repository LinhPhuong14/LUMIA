import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-page page-scroll-area flex h-full min-h-0 flex-col" style={{ backgroundColor: "var(--background)", backgroundImage: "var(--site-ambient)" }}>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl bg-[var(--surface)]/90" style={{ borderColor: "var(--border)" }}>
        <div className="shell flex h-16 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]">
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
          <div className="flex-1" />
          <ThemeAwareLogo />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
