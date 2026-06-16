import type { Route } from "next";
import Link from "next/link";
import { ExternalLink, Mail, Phone, Globe, MapPin, Facebook, Instagram } from "lucide-react";

import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { footerColumns } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer
      className="site-footer border-t pt-14 pb-8"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-footer, var(--surface))",
      }}
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 – Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <ThemeAwareLogo />
            <p className="mt-3 text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
              Thấu hiểu giấc ngủ. Nuôi dưỡng hạnh phúc.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ - theo dõi cảm xúc, phân tích dữ liệu và AI lắng nghe.
            </p>
          </div>

          {/* Cols 2-4 – Nav columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3
                className="text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--foreground)" }}
              >
                {column.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13px] transition hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href as Route}
                        className="text-[13px] transition hover:opacity-80"
                        style={{ color: "var(--muted)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}

          {/* Col 5 – Social & Contact */}
          <div>
            <h3
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--foreground)" }}
            >
              Theo dõi Lumia
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.facebook.com/share/181NRssH8n/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] transition hover:opacity-80"
                  style={{ color: "var(--muted)" }}
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lumia_healing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] transition hover:opacity-80"
                  style={{ color: "var(--muted)" }}
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  TikTok
                </span>
              </li>
            </ul>
            <ul className="mt-4 space-y-1.5">
              <li className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--muted)" }}>
                <Mail className="h-3 w-3 shrink-0" />
                lumiavn@gmail.com
              </li>
              <li className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--muted)" }}>
                <Phone className="h-3 w-3 shrink-0" />
                0962628004
              </li>
              <li className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--muted)" }}>
                <Globe className="h-3 w-3 shrink-0" />
                lumia.com.vn
              </li>
              <li className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--muted)" }}>
                <MapPin className="h-3 w-3 shrink-0" />
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 border-t pt-6 text-[12px]"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          © 2025 Lumia. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
