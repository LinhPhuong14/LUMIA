"use client";

import { Feather, MessageCircle, Music, Play, Wind, type LucideIcon } from "lucide-react";

import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import { mobileTabs } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function PhoneFrame({ tilt, children }: { tilt: string; children: React.ReactNode }) {
  return (
    <div className="relative" style={{ transform: tilt }}>
      <div
        className="overflow-hidden rounded-[40px] bg-[#2a3328] p-2"
        style={{ width: 268, height: 548, boxShadow: "0 28px 60px rgba(42,51,40,0.28)" }}
      >
        <div className="lumia-aura-dashboard relative h-full w-full overflow-hidden rounded-[33px]">
          <div className="absolute left-1/2 top-[9px] z-[20] h-5 w-[72px] -translate-x-1/2 rounded-2xl bg-[#2a3328]" />
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileTabBarPreview({ activeId }: { activeId: string }) {
  return (
    <nav className="mobile-tab-bar-floating !absolute !bottom-3 !left-3 !right-3 !mx-0">
      {mobileTabs.map((item) => {
        const active = item.id === activeId;
        const Icon = item.icon;
        return (
          <div key={item.id} className="mobile-tab-floating-item">
            <span
              className={cn(
                "mobile-tab-floating-chip",
                active ? "bg-[var(--matcha-soft)]" : "bg-transparent",
              )}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={active ? 2 : 1.6}
                style={{ color: active ? "var(--matcha-deep)" : "var(--muted)" }}
              />
            </span>
            <span
              className={cn(
                "text-[9.5px] font-medium",
                active ? "font-semibold text-[var(--matcha-deep)]" : "text-[var(--muted)]",
              )}
            >
              {item.mobileLabel ?? item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function MobileHubHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-[18px] pb-2 pt-10">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/75 backdrop-blur-sm">
        <span className="text-[var(--foreground)]">≡</span>
      </div>
      <span className="font-serif text-lg font-medium text-[var(--foreground)]">Tối nay</span>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/75 backdrop-blur-sm">
        <span className="text-sm">🔔</span>
      </div>
    </header>
  );
}

const QUICK_ACTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Nhật ký", icon: Feather },
  { label: "Hơi thở", icon: Wind },
  { label: "Âm thanh", icon: Music },
  { label: "Lắng nghe", icon: MessageCircle },
];

export function MobileHubPreview() {
  const moods = ["😔", "🙁", "😐", "🙂", "😌"];

  return (
    <div className="relative flex h-full flex-col pb-[88px]">
      <MobileHubHeader />
      <div className="relative z-10 flex-1 overflow-hidden px-4">
        <p className="text-[12px] text-[var(--muted)]">Chào buổi tối, Linh</p>
        <h3 className="mt-0.5 font-serif text-[22px] leading-[1.15] tracking-[-0.02em] text-[var(--foreground)]">
          Hãy để hôm nay <span className="italic text-[var(--matcha-deep)]">lắng lại</span>.
        </h3>

        <div className="relative mt-3 h-[168px] overflow-hidden rounded-[26px] shadow-[0_18px_40px_rgba(122,140,82,0.18)]">
          <MistyScene variant="dawn" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <span className="self-start rounded-full bg-white/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--matcha-text)] backdrop-blur-md">
              Nghi thức tối
            </span>
            <div>
              <h4 className="font-serif text-[20px] text-[#473a28]">Thung lũng sương</h4>
              <p className="text-[11px] text-[#6a5a44]">Soundscape · 18 phút</p>
              <div
                className="mt-2 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Play className="h-3.5 w-3.5" fill="currentColor" />
                Bắt đầu
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)]/95 p-3.5 shadow-sm backdrop-blur-sm">
          <div className="font-serif text-[15px] text-[var(--foreground)]">Hôm nay bạn thế nào?</div>
          <div className="mt-2.5 flex gap-1.5">
            {moods.map((emoji, i) => (
              <div
                key={emoji}
                className="flex flex-1 items-center justify-center rounded-xl py-2 text-[18px]"
                style={{
                  border: i === 3 ? "1.5px solid var(--matcha-deep)" : "1px solid var(--matcha-soft)",
                  background: i === 3 ? "var(--green-wash)" : "var(--surface-warm)",
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <div
              key={action.label}
              className="flex flex-col items-center gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)]/90 py-2.5 backdrop-blur-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--matcha-soft)]">
                <action.icon className="h-4 w-4 text-[var(--matcha-deep)]" />
              </div>
              <span className="text-[9px] font-semibold text-[var(--foreground)]">{action.label}</span>
            </div>
          ))}
        </div>
      </div>
      <MobileTabBarPreview activeId="tonight" />
    </div>
  );
}

export function MobileListenPreview() {
  return (
    <div className="relative flex h-full flex-col pb-[88px]">
      <header className="relative z-10 border-b border-white/50 bg-white/70 px-4 pb-3 pt-10 backdrop-blur-md">
        <h3 className="font-serif text-lg text-[var(--foreground)]">Lắng nghe</h3>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">LUMIA đang ở đây cùng bạn</p>
      </header>

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 overflow-hidden px-4 py-4">
        <div className="max-w-[82%] self-end rounded-[18px] bg-[var(--green-deep)] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
          Hôm nay mình cảm thấy hơi quá tải...
        </div>
        <div className="max-w-[88%] self-start rounded-[18px] border border-white/80 bg-white/92 px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--green-deep)] shadow-sm">
          Mình nghe thấy bạn đang giữ nhiều thứ trong lòng. Muốn kể thêm một chút không?
        </div>
        <div className="max-w-[75%] self-end rounded-[18px] bg-[var(--green-deep)] px-3.5 py-2.5 text-[13px] text-white">
          Có, mình mệt vì công việc...
        </div>
      </div>

      <div className="relative z-10 mx-4 mb-2 flex gap-2">
        <div className="flex-1 rounded-full border border-[var(--border)] bg-white/95 px-3 py-2.5 text-[12px] text-[var(--muted)] backdrop-blur-sm">
          Viết điều trong lòng...
        </div>
        <div className="rounded-full bg-[var(--green)] px-4 py-2.5 text-[12px] font-semibold text-white">Gửi</div>
      </div>

      <MobileTabBarPreview activeId="listen" />
    </div>
  );
}

export function MobileJourneyPreview() {
  return (
    <div className="relative flex h-full flex-col pb-[88px]">
      <header className="relative z-10 px-4 pb-2 pt-10">
        <h3 className="font-serif text-lg text-[var(--foreground)]">Hành trình</h3>
      </header>
      <div className="relative z-10 flex-1 px-4">
        <div className="dash-panel rounded-[22px] p-4">
          <div className="flex justify-center gap-4">
            {[
              { v: "9", l: "Streak" },
              { v: "3.8", l: "Cảm xúc" },
              { v: "142", l: "Phút" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div
                  className="mx-auto flex h-14 w-14 flex-col items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(150deg, #ffffff, var(--green-wash))",
                    boxShadow: "4px 4px 12px rgba(122,140,82,0.14)",
                  }}
                >
                  <span className="font-serif text-lg text-[var(--matcha-deep)]">{s.v}</span>
                </div>
                <span className="mt-1.5 block text-[10px] text-[var(--muted)]">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: i < 9 ? "var(--green-wash)" : "rgba(255,255,255,0.7)",
                border: "1px solid var(--border)",
              }}
            />
          ))}
        </div>
      </div>
      <MobileTabBarPreview activeId="journey" />
    </div>
  );
}
