import type { Route } from "next";
import Link from "next/link";

import { LumiaLogo } from "@/components/ui/logo";
import { getSession } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

const baseLinks: { href: Route; label: string }[] = [
  { href: "/boxes", label: "Hộp LUMIA" },
  { href: "/dashboard", label: "Không gian của bạn" },
];

export async function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const session = await getSession();
  const links =
    session?.role === "admin" ? [...baseLinks, { href: "/admin" as Route, label: "Quản trị" }] : baseLinks;

  return (
    <header className={cn("sticky top-0 z-50 border-b border-white/70 backdrop-blur-xl", transparent ? "bg-white/42" : "bg-white/82")}>
      <div className="shell flex min-h-20 items-center justify-between gap-4">
        <LumiaLogo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted transition hover:text-matcha-deep">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="button-secondary">
              {session.name}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-matcha-deep">
                Đăng nhập
              </Link>
              <Link href={"/register?next=/onboarding" as Route} className="button-primary">
                Tạo tài khoản
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
