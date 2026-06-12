"use client";

import Link from "next/link";
import { Feather, MessageCircle, Music, Play, Wind } from "lucide-react";

import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import { StatDisc } from "@/components/dashboard/shell/stat-disc";

const MOODS = ["😔", "🙁", "😐", "🙂", "😌"];

const quickActions = [
  { href: "/journal", label: "Nhật ký", icon: Feather },
  { href: "/audio/breathing", label: "Hơi thở", icon: Wind },
  { href: "/audio", label: "Âm thanh", icon: Music },
  { href: "/ai", label: "Lắng nghe", icon: MessageCircle },
] as const;

export function HubMobile({
  userName,
  pickedMood,
  streak,
  todayMood,
  onMoodPick,
}: {
  userName: string;
  pickedMood: number | null;
  streak: number;
  todayMood: number | null;
  onMoodPick: (index: number) => void;
}) {
  return (
    <div className="-mx-1 space-y-4 pb-2">
      <div className="px-1">
        <p className="text-[13px] text-[var(--muted)]">Chào buổi tối, {userName}</p>
        <h1 className="mt-0.5 font-serif text-[27px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--foreground)]">
          Hãy để hôm nay <span className="italic text-[var(--matcha-deep)]">lắng lại</span>.
        </h1>
      </div>

      <div className="relative mx-0 h-[300px] overflow-hidden rounded-[30px] shadow-[0_24px_50px_rgba(143,135,110,0.22)]">
        <MistyScene variant="dawn" />
        <div className="absolute inset-0 flex flex-col justify-between p-[22px]">
          <span className="self-start rounded-full bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--matcha-text)] backdrop-blur-md">
            Nghi thức tối
          </span>
          <div>
            <h2 className="font-serif text-[26px] font-normal tracking-[-0.02em] text-[#473a28]">
              Thung lũng sương
            </h2>
            <p className="mt-1 text-[13px] text-[#6a5a44]">Soundscape · 18 phút</p>
            <Link
              href="/audio/sleep"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(95,111,82,0.34)]"
              style={{ background: "var(--gradient-primary, linear-gradient(135deg, #788a64 0%, #54664a 100%))" }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Bắt đầu nghi thức
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-[18px] shadow-[0_10px_26px_rgba(143,135,110,0.1)]">
        <div className="font-serif text-[17px] text-[var(--foreground)]">Hôm nay bạn thế nào?</div>
        <div className="mt-3.5 flex gap-2">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onMoodPick(i)}
              className="aspect-square flex-1 rounded-2xl text-[22px] transition"
              style={{
                border:
                  pickedMood === i ? "1.5px solid var(--matcha-deep)" : "1px solid var(--matcha-soft)",
                background: pickedMood === i ? "var(--mood-high)" : "var(--surface-warm)",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-1.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-1.5 py-3.5"
          >
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[var(--matcha-soft)]">
              <action.icon className="h-[18px] w-[18px] text-[var(--matcha-deep)]" />
            </div>
            <span className="text-[11px] font-semibold text-[var(--foreground)]">{action.label}</span>
          </Link>
        ))}
      </div>

      <div
        className="rounded-[26px] px-[18px] py-5 shadow-[0_14px_34px_rgba(122,140,82,0.12)]"
        style={{ background: "var(--gradient-mist, linear-gradient(180deg, #fdf9ef 0%, #eef4e8 100%))" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-serif text-base text-[var(--foreground)]">Nhịp của bạn</span>
          <span className="text-xs font-semibold text-[var(--matcha-deep)]">Tuần này</span>
        </div>
        <div className="flex gap-2">
          <StatDisc value={String(streak || 9)} unit="ngày" label="Streak" accent="var(--honey-dark)" />
          <StatDisc value={todayMood ? String(todayMood) : "3.8"} unit="/5" label="Cảm xúc" />
          <StatDisc value="142" unit="phút" label="Tĩnh lặng" accent="var(--rose-deep, #c9847d)" />
        </div>
      </div>
    </div>
  );
}
