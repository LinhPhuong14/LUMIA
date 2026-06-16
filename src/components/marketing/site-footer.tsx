import type { Route } from "next";
import Link from "next/link";
import { ExternalLink, Mail, Phone, Globe, MapPin } from "lucide-react";

import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";

const EXPLORE_LINKS: { label: string; href: Route }[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Về chúng tôi", href: "/about" },
  { label: "Tính năng", href: "/#web-app" as Route },
  { label: "Cửa hàng", href: "/store" },
];

const SUPPORT_LINKS: { label: string; href: Route }[] = [
  { label: "Đăng nhập", href: "/login" },
  { label: "Tạo tài khoản", href: "/register" },
  { label: "Cài đặt", href: "/settings" },
];

const LEGAL_LINKS: { label: string; href: Route }[] = [
  { label: "Chính sách bảo mật", href: "/privacy" as Route },
  { label: "Điều khoản sử dụng", href: "/terms" as Route },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/181NRssH8n/?mibextid=wwXIfr",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lumia_healing",
  },
  {
    label: "TikTok",
    href: null,
  },
];

const CONTACT = [
  { icon: Mail, text: "lumiavn@gmail.com", href: "mailto:lumiavn@gmail.com" },
  { icon: Phone, text: "0962628004", href: "tel:0962628004" },
  { icon: Globe, text: "lumia.com.vn", href: null },
  { icon: MapPin, text: "Hà Nội, Việt Nam", href: null },
];

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="site-footer-heading text-[10.5px] font-bold uppercase tracking-[0.16em]">
        {title}
      </h3>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="site-footer border-t"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface-footer, var(--surface-warm))",
      }}
    >
      <div className="shell py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.5fr]">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <ThemeAwareLogo />
            <p className="mt-2 text-[13px] font-semibold text-[var(--foreground)]">
              Thấu hiểu giấc ngủ. Nuôi dưỡng hạnh phúc.
            </p>
            <p className="site-footer-copy mt-2 text-[13px] leading-relaxed">
              Hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ — theo dõi cảm xúc, phân tích
              dữ liệu và AI lắng nghe.
            </p>
          </div>

          {/* Col 2 — Khám phá */}
          <FooterCol title="Khám phá Lumia">
            {EXPLORE_LINKS.map((l) => (
              <div key={l.label}>
                <Link href={l.href} className="site-footer-link text-[13px] transition hover:opacity-90">
                  {l.label}
                </Link>
              </div>
            ))}
          </FooterCol>

          {/* Col 3 — Hỗ trợ */}
          <FooterCol title="Hỗ trợ">
            {SUPPORT_LINKS.map((l) => (
              <div key={l.label}>
                <Link href={l.href} className="site-footer-link text-[13px] transition hover:opacity-90">
                  {l.label}
                </Link>
              </div>
            ))}
          </FooterCol>

          {/* Col 4 — Pháp lý */}
          <FooterCol title="Pháp lý">
            {LEGAL_LINKS.map((l) => (
              <div key={l.label}>
                <Link href={l.href} className="site-footer-link text-[13px] transition hover:opacity-90">
                  {l.label}
                </Link>
              </div>
            ))}
          </FooterCol>

          {/* Col 5 — Social + Liên hệ */}
          <div>
            <h3 className="site-footer-heading text-[10.5px] font-bold uppercase tracking-[0.16em]">
              Theo dõi Lumia
            </h3>
            <div className="mt-3 space-y-2.5">
              {SOCIAL_LINKS.map((s) =>
                s.href ? (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer-link flex items-center gap-1.5 text-[13px] transition hover:opacity-90"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ) : (
                  <span key={s.label} className="site-footer-copy block text-[13px] opacity-50">
                    {s.label} (sắp ra mắt)
                  </span>
                ),
              )}
            </div>

            <h3 className="site-footer-heading mt-5 text-[10.5px] font-bold uppercase tracking-[0.16em]">
              Liên hệ
            </h3>
            <div className="mt-3 space-y-2">
              {CONTACT.map(({ icon: Icon, text, href }) =>
                href ? (
                  <a
                    key={text}
                    href={href}
                    className="site-footer-link flex items-center gap-2 text-[12.5px] transition hover:opacity-90"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    {text}
                  </a>
                ) : (
                  <div key={text} className="site-footer-copy flex items-center gap-2 text-[12.5px]">
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    {text}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <p className="site-footer-copy text-[12px]">
            © 2025 Lumia. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
