"use client";

import { useEffect, useState } from "react";
import { BellRing, Moon, Sun, Flame, CalendarDays, Check } from "lucide-react";

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

type Settings = {
  bedtime_enabled: boolean;
  bedtime_time: string;   // "HH:MM:SS" from DB
  bedtime_lead_min: number;
  morning_enabled: boolean;
  morning_time: string;
  streak_enabled: boolean;
  streak_time: string;
  weekly_enabled: boolean;
  weekly_day: number;
  weekly_time: string;
};

function toHHMM(t: string) { return t?.slice(0, 5) ?? "00:00"; }

const DEFAULT: Settings = {
  bedtime_enabled: true,
  bedtime_time: "22:00:00",
  bedtime_lead_min: 30,
  morning_enabled: false,
  morning_time: "07:00:00",
  streak_enabled: true,
  streak_time: "21:00:00",
  weekly_enabled: true,
  weekly_day: 0,
  weekly_time: "09:00:00",
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--green)]" : "bg-[var(--border)]"}`}
      aria-label={label}
      aria-checked={checked}
      role="switch"
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={toHHMM(value)}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus:border-[var(--green)] focus:outline-none"
    />
  );
}

export function NotificationSettingsSection() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/notifications/settings")
      .then((r) => r.json())
      .then((j: { settings: Settings | null }) => {
        if (j.settings) setSettings(j.settings);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function patch<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/notifications/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        bedtime_time: toHHMM(settings.bedtime_time),
        morning_time: toHHMM(settings.morning_time),
        streak_time:  toHHMM(settings.streak_time),
        weekly_time:  toHHMM(settings.weekly_time),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!loaded) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0,1,2].map((i) => <div key={i} className="h-16 rounded-[20px] bg-[var(--surface)]" />)}
      </div>
    );
  }

  const rows = [
    {
      icon: Moon,
      label: "Báo thức chuẩn bị ngủ",
      desc: `Nhắc ${settings.bedtime_lead_min} phút trước giờ đi ngủ`,
      enabled: settings.bedtime_enabled,
      onToggle: () => patch("bedtime_enabled", !settings.bedtime_enabled),
      extra: settings.bedtime_enabled ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
            <span>Giờ ngủ</span>
            <TimeInput value={settings.bedtime_time} onChange={(v) => patch("bedtime_time", v)} />
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
            <span>Nhắc trước</span>
            <select
              value={settings.bedtime_lead_min}
              onChange={(e) => patch("bedtime_lead_min", Number(e.target.value))}
              className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] text-[var(--foreground)] focus:outline-none"
            >
              {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} phút</option>)}
            </select>
          </div>
        </div>
      ) : null,
    },
    {
      icon: Sun,
      label: "Nhắc check-in buổi sáng",
      desc: "Bắt đầu ngày mới bằng một check-in cảm xúc",
      enabled: settings.morning_enabled,
      onToggle: () => patch("morning_enabled", !settings.morning_enabled),
      extra: settings.morning_enabled ? (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <span>Giờ nhắc</span>
          <TimeInput value={settings.morning_time} onChange={(v) => patch("morning_time", v)} />
        </div>
      ) : null,
    },
    {
      icon: Flame,
      label: "Bảo vệ streak",
      desc: "Nhắc nếu chưa check-in vào buổi tối",
      enabled: settings.streak_enabled,
      onToggle: () => patch("streak_enabled", !settings.streak_enabled),
      extra: settings.streak_enabled ? (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <span>Nhắc lúc</span>
          <TimeInput value={settings.streak_time} onChange={(v) => patch("streak_time", v)} />
        </div>
      ) : null,
    },
    {
      icon: CalendarDays,
      label: "Kiểm tra tâm trạng tuần",
      desc: "Nhắc làm bài kiểm tra tâm trạng hàng tuần",
      enabled: settings.weekly_enabled,
      onToggle: () => patch("weekly_enabled", !settings.weekly_enabled),
      extra: settings.weekly_enabled ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => patch("weekly_day", i)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                  settings.weekly_day === i
                    ? "bg-[var(--green)] text-white"
                    : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
            <span>lúc</span>
            <TimeInput value={settings.weekly_time} onChange={(v) => patch("weekly_time", v)} />
          </div>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-3">
      {rows.map(({ icon: Icon, label, desc, enabled, onToggle, extra }) => (
        <div key={label} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--green-wash)]">
                <Icon className="h-4 w-4 text-[var(--green-deep)]" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--foreground)]">{label}</p>
                <p className="text-[12px] text-[var(--muted)]">{desc}</p>
              </div>
            </div>
            <Toggle label={label} checked={enabled} onChange={onToggle} />
          </div>
          {extra}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-[var(--green)] px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
          {saving ? "Đang lưu…" : saved ? "Đã lưu!" : "Lưu cài đặt"}
        </button>
        {saved && <span className="text-[13px] text-[var(--green)]">Thông báo đã được cập nhật.</span>}
      </div>
    </div>
  );
}
