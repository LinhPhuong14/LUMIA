"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Feather, Flame, Lock, MessageCircle, Music, Sun } from "lucide-react";

import type { WebappPage } from "@/components/landing/data/landing-content";
import { webappPages } from "@/components/landing/data/landing-content";
import { DashboardPreview } from "@/components/landing/shared/dashboard-preview";
import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";

const FW = 1380;
const FH = 920;
const VW = 1100;
const SCALE = VW / FW;
const PREVIEW_HEIGHT = FH * SCALE;

const MOBILE_FEATURES = [
  {
    icon: Sun,
    title: "Check-in hằng ngày",
    desc: "Ghi lại tâm trạng, xem streak và nhận gợi ý cá nhân hoá theo buổi tối.",
  },
  {
    icon: MessageCircle,
    title: "LUMIA lắng nghe",
    desc: "Một không gian riêng tư để nói ra điều đang ở trong lòng - không phán xét.",
  },
  {
    icon: Feather,
    title: "Nhật ký cảm xúc",
    desc: "Viết ra - không cần đúng, chỉ cần thật. LUMIA giữ những gì bạn viết an toàn.",
  },
  {
    icon: Music,
    title: "Âm thanh buổi tối",
    desc: "Soundscape, thiền và nhịp thở được chọn lọc để dẫn bạn vào giấc ngủ.",
  },
  {
    icon: Flame,
    title: "Hành trình & Streak",
    desc: "Nhìn lại cảm xúc theo tuần, theo tháng và theo chuỗi ngày duy trì.",
  },
];

export function WebappDemoSection() {
  const [page, setPage] = useState<WebappPage>("hub");
  const { isDark } = useLumiaTheme();

  return (
    <section id="web-app" className="relative mt-6 overflow-hidden">
      <div className="landing-frame py-16">
        <div className="mb-6 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="lumia-kicker">- LUMIA trên web</span>
            <h2 className="lumia-h2">Một dashboard dịu dàng cho hành trình 21 ngày.</h2>
            <p className="mt-3.5 max-w-[520px] text-base leading-relaxed text-[var(--muted)]">
              Check-in, lắng nghe, nhật ký, âm thanh và streak - tất cả trong một không gian.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="lumia-section-link inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold"
          >
            Mở dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: feature grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {MOBILE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[0_8px_24px_rgba(95,111,82,0.07)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#FFFDF5] to-[#DDE8D2]">
                  <Icon className="h-[18px] w-[18px] text-[var(--green-deep)]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{feat.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: browser mockup */}
        <div className="hidden lg:block">
          <div className="mb-5 flex flex-wrap gap-2">
            {webappPages.map((p) => {
              const on = page === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPage(p.id)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition"
                  style={{
                    background: on ? "var(--green)" : isDark ? "var(--glass-control)" : "rgba(255,255,255,0.7)",
                    color: on ? "#fff" : "var(--foreground)",
                    border: on ? "1px solid transparent" : "1px solid var(--border)",
                    boxShadow: on ? "var(--shadow-green)" : "none",
                  }}
                >
                  <Icon className="h-[15px] w-[15px]" />
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[26px] border border-[var(--border)] bg-surface-card shadow-[0_30px_70px_rgba(95,111,82,0.16)]">
            <div className="flex h-[46px] items-center gap-3.5 border-b border-[var(--border)] bg-[rgba(253,250,242,0.9)] px-[18px]">
              <div className="flex gap-1.5">
                <span className="h-[11px] w-[11px] rounded-full bg-[#DFA6A0]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#EBC872]" />
                <span className="h-[11px] w-[11px] rounded-full bg-[#9CAF88]" />
              </div>
              <div className="flex flex-1 justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-warm)] px-4 py-1.5 text-[12.5px] text-[var(--muted)]">
                  <Lock className="h-[11px] w-[11px]" />
                  app.lumia.vn/dashboard
                </div>
              </div>
              <div className="w-[47px]" />
            </div>
            <div className="relative overflow-hidden bg-surface-card" style={{ height: PREVIEW_HEIGHT }}>
              <div
                className="pointer-events-none absolute left-0 top-0 origin-top-left"
                style={{ width: FW, height: FH, transform: `scale(${SCALE})` }}
              >
                <DashboardPreview page={page} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
