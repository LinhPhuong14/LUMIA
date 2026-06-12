"use client";

import Link from "next/link";
import { Feather, Flame, Moon, Music, Play, TrendingUp } from "lucide-react";

import { Panel } from "@/components/dashboard/shell/panel";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";

const HUB_MOODS = [
  { e: "🙂", l: "Bình yên" },
  { e: "😮‍💨", l: "Mệt" },
  { e: "😟", l: "Lo" },
  { e: "🙁", l: "Buồn" },
  { e: "😣", l: "Căng" },
  { e: "😶", l: "Trống rỗng" },
];

export function HubDesktop({
  moodIndex,
  level,
  streak,
  todayMood,
  onMoodChange,
  onLevelChange,
}: {
  moodIndex: number;
  level: number;
  streak: number;
  todayMood: number | null;
  onMoodChange: (index: number) => void;
  onLevelChange: (level: number) => void;
}) {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="lumia-grain relative h-[168px] overflow-hidden rounded-[24px] shadow-[0_14px_34px_rgba(122,140,82,0.14)]">
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
          <Link
            href="/audio/sleep"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-[26px] py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(122,140,82,0.3)]"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Bắt đầu
          </Link>
        </div>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <Panel title="Bạn đang cảm thấy thế nào?" className="h-auto">
          <div className="grid grid-cols-6 gap-2">
            {HUB_MOODS.map((m, i) => (
              <button
                key={m.l}
                type="button"
                onClick={() => onMoodChange(i)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 text-center transition"
                style={{
                  borderColor: moodIndex === i ? "var(--green)" : "var(--border)",
                  background: moodIndex === i ? "var(--green-wash)" : "var(--surface)",
                }}
              >
                <span className="text-[22px]">{m.e}</span>
                <span className="text-[10.5px] text-[var(--muted)]">{m.l}</span>
              </button>
            ))}
          </div>
          <div className="mt-[18px]">
            <div className="mb-2 flex justify-between text-xs text-[var(--muted)]">
              <span>Mức độ (1–5)</span>
              <span className="font-bold text-[var(--green-deep)]">{level}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              className="w-full accent-[var(--green)]"
            />
          </div>
          <button type="button" className="mt-5 w-full rounded-full bg-[var(--green)] py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(122,140,82,0.28)]">
            Check-in nhẹ nhàng
          </button>
        </Panel>

        <Panel title="Gợi ý cho hôm nay" className="h-auto">
          <div
            className="lumia-grain relative mb-4 rounded-[18px] p-[18px]"
            style={{ background: "var(--gradient-honeyjade)" }}
          >
            <p className="relative max-w-[340px] text-sm leading-relaxed text-[var(--lumia-text)]">
              Bạn vẻ cần một routine nhẹ. Thử mở 2 phút, viết đôi dòng journal và Thiền ngủ 5 phút.
            </p>
          </div>
          <Link
            href="/audio/sleep"
            className="block w-full rounded-full bg-[var(--green)] py-3.5 text-center text-sm font-semibold text-white shadow-[0_12px_26px_rgba(122,140,82,0.28)]"
          >
            Bắt đầu routine
          </Link>
          <div className="mt-3 flex gap-2.5">
            <Link
              href="/audio/meditation"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[13px] font-semibold text-[var(--green-deep)]"
            >
              <Music className="h-[15px] w-[15px]" />
              Nghe thiền
            </Link>
            <Link
              href="/journal"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 text-[13px] font-semibold text-[var(--green-deep)]"
            >
              <Feather className="h-[15px] w-[15px]" />
              Viết journal
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Flame, t: "Streak", v: streak > 0 ? `${streak} ngày` : "Soft Week", s: "7 ngày liên tiếp", c: "var(--honey-dark)" },
          { icon: Moon, t: "Sleep", v: "Wind-down", s: "Thường ngủ lúc 22:15", c: "var(--green-deep)" },
          {
            icon: TrendingUp,
            t: "Mood trend",
            v: todayMood ? `${todayMood}/5` : "Ổn định hơn",
            s: "+12% so với tuần trước",
            c: "var(--rose-deep, #c9847d)",
          },
        ].map((st) => (
          <Panel key={st.t} pad="p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[var(--green-wash)]">
                <st.icon className="h-[18px] w-[18px]" style={{ color: st.c }} />
              </div>
              <span className="text-[12.5px] font-semibold text-[var(--muted)]">{st.t}</span>
            </div>
            <div className="mt-3.5 font-serif text-2xl font-semibold text-[var(--foreground)]">{st.v}</div>
            <div className="mt-1 text-[12.5px] text-[var(--muted)]">{st.s}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
