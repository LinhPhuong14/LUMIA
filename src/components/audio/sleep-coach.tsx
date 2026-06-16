"use client";

import { useRef, useState } from "react";

type Mode = "bedtime" | "waketime";
type SleepType = "deep" | "nap";

interface SleepRecommendation {
  time: string;
  cycles: number;
  duration: string;
  label: string;
  description: string;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

function parseTimeInput(value: string): Date {
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function calcDeepSleepRecommendations(
  inputTime: string,
  mode: "bedtime" | "waketime"
): SleepRecommendation[] {
  const base = parseTimeInput(inputTime);
  const FALL_ASLEEP = 15; // minutes
  const CYCLE = 90; // minutes

  const cycleCounts = [5, 5.5, 6] as const;

  return cycleCounts.map((cycles) => {
    const totalMinutes = Math.round(cycles * CYCLE);

    let resultTime: Date;
    if (mode === "bedtime") {
      resultTime = addMinutes(base, FALL_ASLEEP + totalMinutes);
    } else {
      resultTime = addMinutes(base, -(FALL_ASLEEP + totalMinutes));
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationStr =
      mins === 0 ? `${hours} giờ` : `${hours} giờ ${mins} phút`;

    let label = "";
    let description = "";
    if (cycles === 5) {
      label = "5 chu kỳ · Tối thiểu";
      description =
        "Đủ giấc ngủ tối thiểu để cơ thể phục hồi. Bạn sẽ thức dậy trong giai đoạn ngủ nhẹ, cảm thấy tỉnh táo.";
    } else if (cycles === 5.5) {
      label = "5,5 chu kỳ · Lý tưởng";
      description =
        "Cân bằng tốt giữa thời gian ngủ và chất lượng phục hồi. Được khuyến nghị cho hầu hết người lớn.";
    } else {
      label = "6 chu kỳ · Đủ đầy";
      description =
        "Giấc ngủ trọn vẹn, tối ưu cho sức khoẻ não bộ và thể chất. Lý tưởng khi bạn cần phục hồi sau ngày dài.";
    }

    return {
      time: formatTime(resultTime),
      cycles,
      duration: durationStr,
      label,
      description,
    };
  });
}

function calcNapRecommendations(inputTime: string): SleepRecommendation[] {
  const base = parseTimeInput(inputTime);
  return [
    {
      time: formatTime(addMinutes(base, 20)),
      cycles: 0,
      duration: "20 phút",
      label: "Ngủ nhanh · Không mơ màng",
      description:
        "Chỉ vào giai đoạn ngủ nhẹ (N1–N2). Thức dậy ngay, không bị cảm giác choáng váng. Tốt nhất cho giờ nghỉ trưa hoặc giữa chiều.",
    },
    {
      time: formatTime(addMinutes(base, 90)),
      cycles: 1,
      duration: "90 phút",
      label: "1 chu kỳ đầy đủ · Phục hồi sâu",
      description:
        "Trải qua đủ các giai đoạn: ngủ nhẹ → ngủ sâu → REM. Thức dậy tự nhiên, cảm thấy như được nạp lại năng lượng. Dùng khi thiếu ngủ nghiêm trọng.",
    },
  ];
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [hh, mm] = value.split(":");
  const mmRef = useRef<HTMLInputElement>(null);

  function handleHH(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(-2);
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? "00" : String(Math.min(23, n)).padStart(2, "0");
    onChange(`${clamped}:${mm}`);
    if (raw.length === 2) mmRef.current?.focus();
  }

  function handleMM(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(-2);
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? "00" : String(Math.min(59, n)).padStart(2, "0");
    onChange(`${hh}:${clamped}`);
  }

  const inputCls =
    "w-[64px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] py-2 text-center text-2xl font-bold text-[var(--foreground)] outline-none ring-[var(--green)]/20 focus:border-[var(--green)] focus:ring-4 transition";

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={hh}
        onChange={handleHH}
        className={inputCls}
        placeholder="HH"
        aria-label="Giờ"
      />
      <span className="text-2xl font-bold text-[var(--muted)]">:</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={mm}
        onChange={handleMM}
        className={inputCls}
        placeholder="MM"
        aria-label="Phút"
      />
    </div>
  );
}

export function SleepCoach() {
  const now = new Date();
  const defaultBedtime = formatTime(new Date(now.getTime() + 30 * 60 * 1000));
  const defaultWake = "06:00";

  const [mode, setMode] = useState<Mode>("bedtime");
  const [sleepType, setSleepType] = useState<SleepType>("deep");
  const [bedtimeInput, setBedtimeInput] = useState(defaultBedtime);
  const [waketimeInput, setWaketimeInput] = useState(defaultWake);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const inputTime = mode === "bedtime" ? bedtimeInput : waketimeInput;

  const recommendations =
    sleepType === "nap"
      ? calcNapRecommendations(bedtimeInput)
      : calcDeepSleepRecommendations(inputTime, mode);

  function handleBedtimeChange(val: string) {
    setBedtimeInput(val);
    setSelectedIdx(null);
  }
  function handleWaketimeChange(val: string) {
    setWaketimeInput(val);
    setSelectedIdx(null);
  }
  function handleModeChange(m: Mode) {
    setMode(m);
    setSelectedIdx(null);
  }
  function handleSleepTypeChange(t: SleepType) {
    setSleepType(t);
    setSelectedIdx(null);
  }

  return (
    <div
      className="mb-6 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5"
      style={{ color: "var(--foreground)" }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🌙</span>
        <div>
          <h2 className="text-base font-semibold leading-tight">Sleep Coach</h2>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Tính toán thời điểm ngủ &amp; thức dậy tối ưu dựa trên chu kỳ giấc ngủ
          </p>
        </div>
      </div>

      {/* Sleep type tabs */}
      <div
        className="mb-4 flex rounded-[12px] p-1"
        style={{ background: "var(--surface)" }}
      >
        {(
          [
            { key: "deep", label: "Ngủ sâu", sub: "5–6 chu kỳ · 7.5–9h" },
            { key: "nap", label: "Ngủ nhanh", sub: "20 phút hoặc 90 phút" },
          ] as const
        ).map(({ key, label, sub }) => (
          <button
            key={key}
            onClick={() => handleSleepTypeChange(key)}
            className="flex flex-1 flex-col items-center rounded-[10px] px-3 py-2 text-center transition-all"
            style={{
              background: sleepType === key ? "var(--green)" : "transparent",
              color: sleepType === key ? "#fff" : "var(--muted)",
            }}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-[10px] opacity-80">{sub}</span>
          </button>
        ))}
      </div>

      {/* Mode selector - only for deep sleep */}
      {sleepType === "deep" && (
        <div className="mb-4 flex gap-2">
          {(
            [
              { key: "bedtime", label: "Tôi muốn ngủ lúc…" },
              { key: "waketime", label: "Tôi muốn thức lúc…" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className="flex-1 rounded-[10px] border px-3 py-2 text-xs font-medium transition-all"
              style={{
                borderColor: mode === key ? "var(--green)" : "var(--border)",
                background: mode === key ? "var(--green-wash)" : "transparent",
                color: mode === key ? "var(--green-deep)" : "var(--muted)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Time input */}
      <div className="mb-4">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          {sleepType === "nap"
            ? "Bạn sẽ bắt đầu ngủ lúc:"
            : mode === "bedtime"
            ? "Thời điểm lên giường:"
            : "Thời điểm muốn thức dậy:"}
        </label>
        <TimeInput
          value={
            sleepType === "nap" || mode === "bedtime"
              ? bedtimeInput
              : waketimeInput
          }
          onChange={
            sleepType === "nap" || mode === "bedtime"
              ? handleBedtimeChange
              : handleWaketimeChange
          }
        />
        {sleepType === "deep" && mode === "bedtime" && (
          <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
            * Tính thêm ~15 phút để vào giấc ngủ
          </p>
        )}
      </div>

      {/* Recommendations */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {sleepType === "nap"
            ? "Chọn thời lượng ngủ ngắn:"
            : mode === "bedtime"
            ? "Nên thức dậy lúc:"
            : "Nên lên giường lúc:"}
        </p>

        {recommendations.map((rec, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedIdx(isSelected ? null : i)}
              className="w-full rounded-[14px] border p-4 text-left transition-all"
              style={{
                borderColor: isSelected ? "var(--green)" : "var(--border)",
                background: isSelected ? "var(--green-wash)" : "var(--surface)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: isSelected
                          ? "var(--green-deep)"
                          : "var(--foreground)",
                      }}
                    >
                      {rec.time}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      {rec.duration}
                    </span>
                  </div>
                  <div
                    className="mt-0.5 text-xs font-medium"
                    style={{
                      color: isSelected
                        ? "var(--green-deep)"
                        : "var(--muted)",
                    }}
                  >
                    {rec.label}
                  </div>
                </div>
                <div
                  className="mt-1 shrink-0 rounded-full p-1"
                  style={{
                    background: isSelected ? "var(--green)" : "var(--border)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ color: isSelected ? "#fff" : "var(--muted)" }}
                  >
                    {isSelected ? (
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <path
                        d="M6 2v8M2 6h8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {isSelected && (
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: "var(--green-deep)" }}
                >
                  {rec.description}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer tip */}
      <div
        className="mt-4 rounded-[10px] px-3 py-2 text-[11px] leading-relaxed"
        style={{
          background: "var(--surface)",
          color: "var(--muted)",
        }}
      >
        💡{" "}
        {sleepType === "nap"
          ? "Tránh ngủ trưa sau 15:00 để không ảnh hưởng giấc tối. Đặt báo thức để không ngủ quá."
          : "Mỗi chu kỳ ngủ kéo dài ~90 phút gồm ngủ nhẹ → ngủ sâu → REM. Thức dậy đúng chu kỳ giúp bạn tỉnh táo hơn nhiều."}
      </div>
    </div>
  );
}
