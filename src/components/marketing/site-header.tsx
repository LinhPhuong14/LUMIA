import type { Route } from "next";
import Link from "next/link";

import { MobileNavDrawer } from "@/components/marketing/mobile-nav-drawer";
import { SiteHeaderActions, SiteHeaderNavLink } from "@/components/marketing/site-header-actions";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { marketingNavLinks } from "@/lib/site-nav";
import { getSession } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export async function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const session = await getSession();
  const links: { href: Route; label: string }[] = [...marketingNavLinks];
  if (session?.role === "admin") {
    links.push({ href: "/admin", label: "Quản trị" });
  }

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 border-b backdrop-blur-xl",
        transparent ? "bg-[var(--surface-glass)]" : "bg-[var(--surface)]/90",
      )}
      style={{
        paddingTop: "var(--safe-top)",
        borderColor: "var(--border)",
        height: "var(--marketing-header-height, auto)",
      }}
    >
      <div className="shell flex min-h-16 items-center justify-between gap-3 md:min-h-20">
        <ThemeAwareLogo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <SiteHeaderNavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <MobileNavDrawer links={links} session={session ? { name: session.name } : null} />
          <SiteHeaderActions session={session ? { name: session.name } : null} />
        </div>
      </div>
    </header>
  );
}
