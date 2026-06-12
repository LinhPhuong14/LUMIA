"use client";

import { Bell, Crown, Feather, Flame, MessageCircle, Moon, Music, Play, TrendingUp } from "lucide-react";

import type { WebappPage } from "@/components/landing/data/landing-content";
import { desktopNav } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

import { MistyScene } from "@/components/dashboard/shell/misty-scene";

const PAGE_NAV: Record<WebappPage, string> = {
  hub: "hub",
  listen: "listen",
  journal: "journal",
  audio: "audio",
  streak: "streak",
};

const PAGE_TITLES: Record<WebappPage, { title: string; subtitle: string }> = {
  hub: { title: "Chào buổi tối, Linh 👋", subtitle: "Hôm nay bạn muốn bắt đầu từ đâu?" },
  listen: { title: "LUMIA lắng nghe bạn.", subtitle: "Một không gian riêng tư để bạn được nói ra điều đang ở trong lòng." },
  journal: { title: "Nhật ký", subtitle: "Viết ra — không cần đúng, chỉ cần thật." },
  audio: { title: "Âm thanh", subtitle: "Soundscape, thiền và nhịp thở cho buổi tối." },
  streak: { title: "Hành trình của bạn", subtitle: "Nhìn lại mood, streak và báo cáo tuần." },
};

function PreviewSidebar({ page }: { page: WebappPage }) {
  const activeId = PAGE_NAV[page];

  return (
    <aside className="dash-sidebar flex h-full w-[250px] shrink-0 flex-col p-5">
      <div className="flex items-center gap-2 px-2 pb-4 pt-1">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
          style={{ background: "var(--gradient-emerald)" }}
        >
          <span className="font-serif text-sm font-semibold text-white">L</span>
        </div>
        <span className="font-serif text-[21px] font-semibold text-[var(--green-deep)]">lumia</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {desktopNav.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeId;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-[16px] px-3.5 py-[11px] text-[13.5px] font-medium",
                active
                  ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.95),var(--green-wash))] font-semibold text-[var(--green-deep)] shadow-[0_8px_20px_rgba(122,140,82,0.12)]"
                  : "text-[var(--muted)]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.7} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-white/50 p-2.5">
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-bold text-white"
          style={{ background: "var(--gradient-jade)" }}
        >
          NL
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold text-[var(--foreground)]">Ng Linh</div>
          <div className="truncate text-[11px] text-[var(--muted)]">Dùng thử</div>
        </div>
      </div>
    </aside>
  );
}

function PreviewTopBar({ page }: { page: WebappPage }) {
  const { title, subtitle } = PAGE_TITLES[page];
  return (
    <header className="flex shrink-0 items-center justify-between px-1 py-3">
      <div>
        <h1 className="font-serif text-[27px] font-medium tracking-[-0.02em] text-[var(--foreground)]">{title}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--muted)]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)]">
          <Bell className="h-[18px] w-[18px] text-[var(--muted)]" />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] py-1.5 pl-3.5 pr-1.5">
          <Crown className="h-3.5 w-3.5 text-[var(--honey-dark)]" />
          <span className="text-[12.5px] font-semibold text-[var(--green-deep)]">Dùng thử</span>
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: "var(--gradient-jade)" }}
          >
            NL
          </div>
        </div>
      </div>
    </header>
  );
}

function PreviewPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("dash-panel flex flex-col rounded-[26px] p-7", className)}>
      {title ? <h3 className="mb-5 font-serif text-[17px] font-semibold text-[var(--foreground)]">{title}</h3> : null}
      {children}
    </section>
  );
}

function HubPreview() {
  const moods = ["🙂", "😮‍💨", "😟", "🙁", "😣", "😶"];
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="relative h-[168px] overflow-hidden rounded-[24px] shadow-[0_14px_34px_rgba(122,140,82,0.14)]">
        <MistyScene variant="dawn" />
        <div className="absolute inset-0 flex items-center justify-between px-[30px]">
          <div>
            <span className="inline-flex rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--matcha-text)] backdrop-blur-sm">
              Nghi thức tối nay
            </span>
            <h2 className="mt-3 font-serif text-[27px] font-medium tracking-[-0.02em] text-[#42361f]">
              Thung lũng sương · 18 phút
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-[26px] py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(122,140,82,0.3)]">
            <Play className="h-4 w-4" fill="currentColor" />
            Bắt đầu
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        <PreviewPanel title="Bạn đang cảm thấy thế nào?">
          <div className="grid grid-cols-6 gap-2">
            {moods.map((e, i) => (
              <div
                key={e}
                className="flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-center"
                style={{
                  borderColor: i === 0 ? "var(--green)" : "var(--border)",
                  background: i === 0 ? "var(--green-wash)" : "var(--surface)",
                }}
              >
                <span className="text-[22px]">{e}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 rounded-full bg-[var(--green-wash)]">
            <div className="h-full w-[60%] rounded-full bg-[var(--green)]" />
          </div>
          <div className="mt-5 rounded-full bg-[var(--green)] py-3.5 text-center text-sm font-semibold text-white">
            Check-in nhẹ nhàng
          </div>
        </PreviewPanel>

        <PreviewPanel title="Gợi ý cho hôm nay">
          <div
            className="mb-4 rounded-[18px] p-[18px]"
            style={{ background: "var(--gradient-honeyjade)" }}
          >
            <p className="text-sm leading-relaxed text-[var(--lumia-text)]">
              Bạn vẻ cần một routine nhẹ. Thử mở 2 phút, viết đôi dòng journal và Thiền ngủ 5 phút.
            </p>
          </div>
          <div className="rounded-full bg-[var(--green)] py-3.5 text-center text-sm font-semibold text-white">
            Bắt đầu routine
          </div>
          <div className="mt-3 flex gap-2.5">
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[13px] font-semibold text-[var(--green-deep)]">
              <Music className="h-[15px] w-[15px]" />
              Nghe thiền
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[13px] font-semibold text-[var(--green-deep)]">
              <Feather className="h-[15px] w-[15px]" />
              Viết journal
            </div>
          </div>
        </PreviewPanel>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {[
          { icon: Flame, t: "Streak", v: "7 ngày", c: "var(--honey-dark)" },
          { icon: Moon, t: "Sleep", v: "Wind-down", c: "var(--green-deep)" },
          { icon: TrendingUp, t: "Mood trend", v: "Ổn định hơn", c: "#c9847d" },
        ].map((st) => (
          <PreviewPanel key={st.t} className="!p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[var(--green-wash)]">
                <st.icon className="h-[18px] w-[18px]" style={{ color: st.c }} />
              </div>
              <span className="text-[12.5px] font-semibold text-[var(--muted)]">{st.t}</span>
            </div>
            <div className="mt-3.5 font-serif text-2xl font-semibold text-[var(--foreground)]">{st.v}</div>
          </PreviewPanel>
        ))}
      </div>
    </div>
  );
}

function ListenPreview() {
  return (
    <div className="grid h-full grid-cols-[240px_1fr] gap-6">
      <PreviewPanel className="!p-5">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Bắt đầu nhanh</span>
        <div className="mt-4 space-y-2">
          {["Tối nay mình thấy hơi quá tải", "Mình đang không biết bắt đầu từ đâu"].map((t) => (
            <div key={t} className="rounded-[20px] border border-white/70 bg-white px-4 py-3 text-sm text-[var(--green-deep)]">
              {t}
            </div>
          ))}
        </div>
      </PreviewPanel>
      <PreviewPanel className="flex min-h-[480px] flex-col !p-6">
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          <div className="max-w-[75%] self-end rounded-[20px] bg-[var(--green-deep)] px-4 py-3 text-[15px] text-white">
            Tối nay mình thấy hơi quá tải...
          </div>
          <div className="max-w-[85%] self-start rounded-[20px] border border-white/80 bg-white/90 px-4 py-3 text-[15px] text-[var(--green-deep)] shadow-sm">
            Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ. Bạn muốn kể thêm chút không?
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
            Viết điều đang ở trong lòng bạn…
          </div>
          <div className="rounded-full bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white">Gửi</div>
        </div>
      </PreviewPanel>
    </div>
  );
}

function JournalPreview() {
  const entries = [
    { date: "Hôm nay", text: "Có lúc mình chỉ cần được dừng lại vài phút..." },
    { date: "Hôm qua", text: "Buổi tối nhẹ hơn khi mình viết ra những lo lắng." },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {["Hôm nay", "Tuần này", "Tất cả"].map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-semibold",
              i === 0 ? "bg-[var(--green)] text-white" : "border border-[var(--border)] bg-white text-[var(--green-deep)]",
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((e) => (
          <PreviewPanel key={e.date}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{e.date}</span>
            <p className="mt-3 font-serif text-lg leading-relaxed text-[var(--foreground)]">{e.text}</p>
          </PreviewPanel>
        ))}
      </div>
    </div>
  );
}

function AudioPreview() {
  const tracks = [
    { t: "Thung lũng sương", g: "var(--gradient-jade)", d: "18 phút" },
    { t: "Mưa hiên", g: "var(--gradient-emerald)", d: "12 phút" },
    { t: "Rừng đêm", g: "var(--gradient-iris)", d: "24 phút" },
    { t: "Thiền mini", g: "var(--gradient-honeyjade)", d: "5 phút" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {tracks.map((tr) => (
        <div key={tr.t} className="dash-panel overflow-hidden rounded-[26px]">
          <div className="h-[100px]" style={{ background: tr.g }} />
          <div className="p-4">
            <div className="font-serif text-lg text-[var(--foreground)]">{tr.t}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">{tr.d} · Soundscape</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StreakPreview() {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-3 gap-[18px]">
        {[
          { icon: Flame, v: "7", l: "Streak" },
          { icon: MessageCircle, v: "4.2", l: "Mood TB" },
          { icon: Music, v: "142", l: "Phút tĩnh" },
        ].map((s) => (
          <PreviewPanel key={s.l} className="!p-5 text-center">
            <s.icon className="mx-auto h-5 w-5 text-[var(--green)]" />
            <div className="mt-3 font-serif text-3xl font-semibold text-[var(--green-deep)]">{s.v}</div>
            <div className="text-xs text-[var(--muted)]">{s.l}</div>
          </PreviewPanel>
        ))}
      </div>
      <PreviewPanel title="21 ngày hành trình">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[10px]"
              style={{
                background: i < 7 ? "var(--green-wash)" : "rgba(255,255,255,0.6)",
                border: i === 6 ? "2px solid var(--green)" : "1px solid var(--border)",
              }}
            />
          ))}
        </div>
      </PreviewPanel>
    </div>
  );
}

function PreviewPageContent({ page }: { page: WebappPage }) {
  switch (page) {
    case "hub":
      return <HubPreview />;
    case "listen":
      return <ListenPreview />;
    case "journal":
      return <JournalPreview />;
    case "audio":
      return <AudioPreview />;
    case "streak":
      return <StreakPreview />;
  }
}

export function DashboardPreview({ page }: { page: WebappPage }) {
  return (
    <div className="lumia-aura-dashboard lumia-grain-soft relative flex h-[920px] w-[1380px] overflow-hidden">
      <div className="dashboard-glow dashboard-glow--mint !absolute opacity-60" aria-hidden />
      <div className="dashboard-glow dashboard-glow--lime !absolute opacity-50" aria-hidden />

      <div className="relative z-[1] flex h-full w-full gap-4 p-4">
        <PreviewSidebar page={page} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PreviewTopBar page={page} />
          <div className="min-h-0 flex-1 overflow-hidden pt-1">
            <PreviewPageContent page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
