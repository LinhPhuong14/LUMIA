"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { UpsellOverlay } from "@/components/ui/upsell-overlay";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeeklyAnswers {
  moodScore: number | null;
  dominantEmotion: string | null;
  moodInfluencer: string | null;
  sleepScore: number | null;
  sleepHours: string | null;
  wakeFeeling: string | null;
  stressScore: number | null;
  improveGoals: string[];
  openNote: string;
  tonightChoice: string | null;
}

interface WeeklyResult {
  moodScore: number;
  sleepScore: number;
  stressScore: number;
  dominantEmotion: string | null;
  improveGoals: string[];
}

const defaultAnswers: WeeklyAnswers = {
  moodScore: null,
  dominantEmotion: null,
  moodInfluencer: null,
  sleepScore: null,
  sleepHours: null,
  wakeFeeling: null,
  stressScore: null,
  improveGoals: [],
  openNote: "",
  tonightChoice: null,
};

// ---------------------------------------------------------------------------
// Question data
// ---------------------------------------------------------------------------

const MOOD_OPTIONS = [
  { emoji: "😄", label: "Tuyệt vời", value: 5 },
  { emoji: "🙂", label: "Khá ổn", value: 4 },
  { emoji: "😐", label: "Bình thường", value: 3 },
  { emoji: "😔", label: "Buồn", value: 2 },
  { emoji: "😣", label: "Căng thẳng", value: 1 },
];

const EMOTION_OPTIONS = [
  { label: "Vui vẻ", value: "joy" },
  { label: "Bình yên", value: "peace" },
  { label: "Lo lắng", value: "worry" },
  { label: "Căng thẳng", value: "stress" },
  { label: "Buồn bã", value: "sadness" },
  { label: "Mất động lực", value: "unmotivated" },
];

const INFLUENCER_OPTIONS = [
  { label: "Công việc / Học tập", value: "work" },
  { label: "Gia đình", value: "family" },
  { label: "Các mối quan hệ", value: "relationships" },
  { label: "Sức khỏe", value: "health" },
  { label: "Tài chính", value: "finance" },
  { label: "Khác", value: "other" },
];

const SLEEP_HOURS_OPTIONS = [
  { label: "Dưới 5 giờ", value: "under_5" },
  { label: "5 – 6 giờ", value: "5_6" },
  { label: "6 – 7 giờ", value: "6_7" },
  { label: "7 – 8 giờ", value: "7_8" },
  { label: "Trên 8 giờ", value: "over_8" },
];

const WAKE_OPTIONS = [
  { emoji: "😴", label: "Vẫn mệt", value: "tired" },
  { emoji: "🙂", label: "Bình thường", value: "normal" },
  { emoji: "😊", label: "Tỉnh táo", value: "refreshed" },
  { emoji: "✨", label: "Tràn đầy năng lượng", value: "energized" },
];

const IMPROVE_OPTIONS = [
  { label: "Ngủ sớm hơn", value: "sleep_early" },
  { label: "Giảm căng thẳng", value: "reduce_stress" },
  { label: "Tập thể dục nhiều hơn", value: "exercise" },
  { label: "Quản lý cảm xúc tốt hơn", value: "emotion_management" },
  { label: "Dành thời gian cho bản thân", value: "self_time" },
  { label: "Khác", value: "other" },
];

const TONIGHT_OPTIONS = [
  {
    emoji: "💬",
    title: "Tâm sự",
    description: "AI Chatbot — không gian lắng nghe không phán xét",
    value: "chat",
    href: "/dashboard",
  },
  {
    emoji: "🎵",
    title: "Im lặng",
    description: "Âm thanh sóng não thiền định được thiết kế riêng cho tâm trạng tối nay",
    value: "sound",
    href: "/dashboard",
  },
  {
    emoji: "🫁",
    title: "Thực hành",
    description: "Bài tập thở điều hòa nhịp tim và thiền ngắn",
    value: "breathing",
    href: "/dashboard",
  },
];

const TOTAL_QUESTIONS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

function ScaleRow({
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex h-12 flex-1 items-center justify-center rounded-2xl border text-base font-semibold transition active:scale-95 ${
            value === n
              ? "border-matcha bg-matcha-soft/40 text-matcha-deep"
              : "border-[var(--border)] bg-white/80 text-[var(--muted)] hover:bg-white"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function buildPersonalizedMessage(a: WeeklyAnswers): string {
  if (a.moodScore !== null && a.moodScore <= 2)
    return "Tuần này có vẻ khá nặng nề với bạn. Hãy cho bản thân không gian để nghỉ ngơi và không cần phải ổn ngay.";
  if (a.sleepScore !== null && a.sleepScore <= 2)
    return "Giấc ngủ của bạn đang cần được chú ý. Thử thêm một thói quen nhỏ trước khi ngủ — LUMIA ở đây để giúp bạn.";
  if (a.stressScore !== null && a.stressScore >= 4)
    return "Mức căng thẳng của bạn khá cao tuần này. Hãy ưu tiên nghỉ ngơi và đừng ngần ngại tâm sự với LUMIA.";
  if (a.moodScore !== null && a.moodScore >= 4)
    return "Bạn đang có một tuần khá tốt! Hãy duy trì năng lượng đó — mỗi ngày tích cực là một bước tiến.";
  return "Cảm ơn bạn đã dành thời gian nhìn lại chính mình. Mỗi tuần check-in là một bước chăm sóc bản thân rất có ý nghĩa.";
}

function buildSuggestions(a: WeeklyAnswers): string[] {
  const tips: string[] = [];
  if (a.sleepScore !== null && a.sleepScore <= 3)
    tips.push("Thử thêm 30 phút thư giãn trước khi ngủ bằng âm thanh thiền định của LUMIA.");
  if (a.stressScore !== null && a.stressScore >= 3)
    tips.push("Bài tập thở 4-7-8 trước khi ngủ giúp hạ nhịp tim và giảm cortisol hiệu quả.");
  if (a.improveGoals.includes("reduce_stress"))
    tips.push("Viết một dòng nhật ký ngắn mỗi tối — ghi ra giúp não bộ xử lý cảm xúc tốt hơn.");
  if (a.improveGoals.includes("sleep_early"))
    tips.push("Đặt báo thức 'chuẩn bị ngủ' sớm hơn 30 phút — thói quen nhỏ, hiệu quả lớn.");
  if (tips.length < 2)
    tips.push("Duy trì check-in cảm xúc mỗi tuần để LUMIA hiểu bạn ngày càng tốt hơn.");
  return tips.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MoodTestQuiz({ isActive }: { isActive: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = intro, 1-10 = questions, 11 = report
  const [answers, setAnswers] = useState<WeeklyAnswers>(defaultAnswers);
  const [loading, setLoading] = useState(true);
  const [hasTakenThisWeek, setHasTakenThisWeek] = useState(false);
  const [latestResult, setLatestResult] = useState<WeeklyResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    fetch("/api/mood/weekly-assessment")
      .then((r) => r.json())
      .then((data: { hasCurrentWeek?: boolean; latest?: WeeklyResult }) => {
        setHasTakenThisWeek(!!data.hasCurrentWeek);
        if (data.latest) setLatestResult(data.latest);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  function autoAdvance(updatedAnswers: WeeklyAnswers) {
    setAnswers(updatedAnswers);
    setTimeout(goNext, 300);
  }

  async function submit(finalAnswers: WeeklyAnswers) {
    setSubmitting(true);
    try {
      await fetch("/api/mood/weekly-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodScore: finalAnswers.moodScore,
          dominantEmotion: finalAnswers.dominantEmotion,
          moodInfluencer: finalAnswers.moodInfluencer,
          sleepScore: finalAnswers.sleepScore,
          sleepHours: finalAnswers.sleepHours,
          wakeFeeling: finalAnswers.wakeFeeling,
          stressScore: finalAnswers.stressScore,
          improveGoals: finalAnswers.improveGoals,
          openNote: finalAnswers.openNote || undefined,
          tonightChoice: finalAnswers.tonightChoice,
        }),
      });
    } catch {
      // Non-blocking — still show report
    }
    setSubmitting(false);
    setDirection(1);
    setStep(11);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
      </div>
    );
  }

  // Intro screen
  if (step === 0) {
    return (
      <div className="space-y-5 py-2 text-center">
        <p className="text-2xl">📅</p>
        <h2 className="font-serif text-xl font-semibold text-matcha-deep">Mood Test hằng tuần</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Đã một tuần trôi qua. Hãy dành vài phút để nhìn lại cảm xúc và sức khỏe tinh thần của bạn nhé.
        </p>
        <button
          type="button"
          onClick={() => { setDirection(1); setStep(1); }}
          className="dash-accent-btn w-full"
        >
          Bắt đầu kiểm tra →
        </button>
        {hasTakenThisWeek && latestResult ? (
          <button
            type="button"
            onClick={() => setStep(11)}
            className="button-secondary w-full text-sm"
          >
            Xem báo cáo tuần này
          </button>
        ) : null}
      </div>
    );
  }

  // Report screen
  if (step === 11) {
    const result = latestResult ?? {
      moodScore: answers.moodScore ?? 3,
      sleepScore: answers.sleepScore ?? 3,
      stressScore: answers.stressScore ?? 3,
      dominantEmotion: answers.dominantEmotion,
      improveGoals: answers.improveGoals,
    };
    const message = buildPersonalizedMessage(answers.tonightChoice ? answers : {
      ...defaultAnswers,
      moodScore: result.moodScore,
      sleepScore: result.sleepScore,
      stressScore: result.stressScore,
    });
    const suggestions = buildSuggestions(answers.tonightChoice ? answers : {
      ...defaultAnswers,
      improveGoals: result.improveGoals,
      stressScore: result.stressScore,
      sleepScore: result.sleepScore,
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 py-2"
      >
        <div className="text-center">
          <p className="text-2xl">✨</p>
          <h2 className="mt-2 font-serif text-xl font-semibold text-matcha-deep">Báo cáo từ LUMIA</h2>
          <p className="mt-1 text-[12px] text-[var(--muted)]">Dựa trên kết quả của bạn</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Tâm trạng", score: result.moodScore, color: "var(--green-deep)" },
            { label: "Giấc ngủ", score: result.sleepScore, color: "var(--matcha-deep)" },
            { label: "Căng thẳng", score: result.stressScore, color: "#e07b5f" },
          ].map(({ label, score, color }) => (
            <div key={label} className="flex flex-col items-center rounded-[18px] border border-[var(--border)] bg-white/80 py-4">
              <span className="text-2xl font-bold" style={{ color }}>{score}/5</span>
              <span className="mt-1 text-[11px] text-[var(--muted)]">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] bg-[var(--green-wash)] px-4 py-4">
          <p className="text-[13px] leading-6 text-[var(--foreground)]">{message}</p>
        </div>

        {suggestions.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Gợi ý cho tuần tới
            </p>
            <ul className="space-y-2">
              {suggestions.map((tip) => (
                <li key={tip} className="flex gap-2 text-[13px] leading-6 text-[var(--foreground)]">
                  <span className="mt-1 shrink-0 text-[var(--green)]">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Thông điệp từ LUMIA</p>
          <p className="mt-2 text-[13px] italic leading-6 text-[var(--foreground)]">
            "Cảm ơn bạn đã dành thời gian lắng nghe chính mình hôm nay. Mỗi giấc ngủ là một cơ hội để cơ thể hồi phục và tâm trí được nghỉ ngơi."
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="dash-accent-btn w-full"
        >
          Khám phá Dashboard
        </button>
      </motion.div>
    );
  }

  // Blocked: already taken this week + free user
  if (hasTakenThisWeek && !isActive && latestResult) {
    return (
      <UpsellOverlay
        featureName="Mood Test hàng tuần"
        description="Nâng cấp để làm Mood Test mỗi tuần và xem xu hướng cảm xúc theo thời gian."
        locked
      >
        <div className="py-2 text-center text-sm text-[var(--muted)]">
          Bạn đã hoàn thành Mood Test tuần này.
        </div>
      </UpsellOverlay>
    );
  }

  // Progress
  const progress = ((step - 1) / TOTAL_QUESTIONS) * 100;

  // Questions
  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => autoAdvance({ ...answers, moodScore: opt.value })}
                  className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] ${
                    answers.moodScore === opt.value
                      ? "border-matcha bg-matcha-soft/30"
                      : "border-[var(--border)] bg-white/80 hover:bg-white"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium text-matcha-deep">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-wrap gap-2">
            {EMOTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => autoAdvance({ ...answers, dominantEmotion: opt.value })}
                className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition active:scale-95 ${
                  answers.dominantEmotion === opt.value
                    ? "border-matcha bg-matcha-soft/40 text-matcha-deep"
                    : "border-[var(--border)] bg-white/80 text-[var(--foreground)] hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-wrap gap-2">
            {INFLUENCER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => autoAdvance({ ...answers, moodInfluencer: opt.value })}
                className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition active:scale-95 ${
                  answers.moodInfluencer === opt.value
                    ? "border-matcha bg-matcha-soft/40 text-matcha-deep"
                    : "border-[var(--border)] bg-white/80 text-[var(--foreground)] hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <ScaleRow
              value={answers.sleepScore}
              onChange={(v) => autoAdvance({ ...answers, sleepScore: v })}
            />
            <p className="text-center text-[11px] text-[var(--muted)]">1 = Rất kém · 5 = Rất tốt</p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-2">
            {SLEEP_HOURS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => autoAdvance({ ...answers, sleepHours: opt.value })}
                className={`w-full rounded-[18px] border px-4 py-3.5 text-left text-[14px] font-medium transition active:scale-[0.99] ${
                  answers.sleepHours === opt.value
                    ? "border-matcha bg-matcha-soft/30 text-matcha-deep"
                    : "border-[var(--border)] bg-white/80 hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-3">
            {WAKE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => autoAdvance({ ...answers, wakeFeeling: opt.value })}
                className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] ${
                  answers.wakeFeeling === opt.value
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-[var(--border)] bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-medium text-matcha-deep">{opt.label}</span>
              </button>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-3">
            <ScaleRow
              value={answers.stressScore}
              onChange={(v) => autoAdvance({ ...answers, stressScore: v })}
            />
            <div className="flex justify-between text-[11px] text-[var(--muted)]">
              <span>Rất thấp</span>
              <span>Rất cao</span>
            </div>
          </div>
        );

      case 8: {
        const maxGoals = 3;
        const selected = answers.improveGoals;
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {IMPROVE_OPTIONS.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? selected.filter((v) => v !== opt.value)
                        : selected.length < maxGoals
                        ? [...selected, opt.value]
                        : selected;
                      setAnswers((prev) => ({ ...prev, improveGoals: next }));
                    }}
                    className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition active:scale-95 ${
                      isSelected
                        ? "border-matcha bg-matcha-soft/40 text-matcha-deep"
                        : "border-[var(--border)] bg-white/80 text-[var(--foreground)] hover:bg-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {selected.length < maxGoals ? (
              <p className="text-[11px] text-[var(--muted)]">Chọn tối đa {maxGoals} mục tiêu</p>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              disabled={selected.length === 0}
              className="dash-accent-btn w-full disabled:opacity-50"
            >
              Tiếp tục →
            </button>
          </div>
        );
      }

      case 9:
        return (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={answers.openNote}
                onChange={(e) => setAnswers((prev) => ({ ...prev, openNote: e.target.value }))}
                placeholder="Nhập cảm nghĩ của bạn..."
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--green)]/15 focus:ring-4"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-[var(--muted)]">
                {answers.openNote.length}/500
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={goNext} className="button-secondary flex-1">
                Bỏ qua
              </button>
              <button type="button" onClick={goNext} className="dash-accent-btn flex-1">
                Tiếp tục →
              </button>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-3">
            {TONIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={submitting}
                onClick={() => {
                  const final = { ...answers, tonightChoice: opt.value };
                  setAnswers(final);
                  setTimeout(() => submit(final), 300);
                }}
                className={`flex w-full items-start gap-4 rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] disabled:opacity-60 ${
                  answers.tonightChoice === opt.value
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-[var(--border)] bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-matcha-deep">{opt.title}</p>
                  <p className="mt-0.5 text-[12px] leading-5 text-[var(--muted)]">{opt.description}</p>
                </div>
              </button>
            ))}
            {submitting ? (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                Đang tạo báo cáo…
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  const titles = [
    "",
    "Tuần này, bạn cảm thấy thế nào?",
    "Cảm xúc nào xuất hiện nhiều nhất trong tuần qua?",
    "Điều gì ảnh hưởng đến tâm trạng của bạn nhiều nhất?",
    "Chất lượng giấc ngủ của bạn trong tuần qua?",
    "Bạn ngủ trung bình bao nhiêu giờ mỗi đêm?",
    "Bạn cảm thấy thế nào khi thức dậy?",
    "Mức độ căng thẳng của bạn trong tuần qua?",
    "Bạn muốn cải thiện điều gì trong tuần tới?",
    "Bạn có điều gì muốn chia sẻ với LUMIA không?",
    "Tối nay, bạn muốn thư giãn bằng cách nào?",
  ];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-matcha-soft/30">
          <div
            className="h-full rounded-full bg-matcha-deep transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--muted)]">Câu {step}/{TOTAL_QUESTIONS}</p>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-4"
        >
          <h3 className="font-serif text-[18px] font-semibold leading-tight text-matcha-deep">
            {titles[step]}
          </h3>
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>

      {step > 1 && step <= 9 ? (
        <button
          type="button"
          onClick={goBack}
          className="mt-1 text-[12px] text-[var(--muted)] underline"
        >
          ← Quay lại
        </button>
      ) : null}
    </div>
  );
}
