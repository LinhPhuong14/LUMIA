import type { Route } from "next";
import Link from "next/link";

import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { footerColumns } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer
      className="site-footer border-t py-10 backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-footer, var(--surface-warm))",
      }}
    >
      <div className="shell">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <ThemeAwareLogo />
            <p className="site-footer-copy mt-3 text-sm leading-7">
              Hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ — theo dõi cảm xúc, phân tích dữ liệu và AI
              lắng nghe.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 md:max-w-2xl">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="site-footer-heading text-xs font-bold uppercase tracking-[0.14em]">
                  {column.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href as Route} className="site-footer-link text-sm transition hover:opacity-90">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="site-footer-copy text-xs">
          © {new Date().getFullYear()} LUMIA · lumia.vn
        </p>
      </div>
    </footer>
  );
}
