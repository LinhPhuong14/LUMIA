"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { BotanicalOrb } from "@/components/landing/botanical/botanical-orb";
import { GenerativeVisual } from "@/components/ui/generative-visual";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Answers {
  nickname: string;
  motivation: string;
  bedtime: string;
  sleepQuality: number | null;
  recentMood: string;
  companionMode: string;
}

const defaultAnswers: Answers = {
  nickname: "",
  motivation: "peace",
  bedtime: "22_23",
  sleepQuality: 3,
  recentMood: "balanced",
  companionMode: "digital",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOTIVATION_OPTIONS = [
  {
    value: "peace",
    icon: "🕊️",
    title: "Tìm kiếm sự bình yên",
    subtitle: "Giảm căng thẳng sau giờ làm/học tập",
  },
  {
    value: "sleep",
    icon: "🌙",
    title: "Cải thiện giấc ngủ",
    subtitle: "Nâng cao chất lượng giấc ngủ và sức khỏe tinh thần",
  },
  {
    value: "habit",
    icon: "🌱",
    title: "Xây dựng thói quen",
    subtitle: "Tạo thói quen chăm sóc bản thân tích cực mỗi ngày",
  },
  {
    value: "self_care",
    icon: "✨",
    title: "Khám phá chăm sóc bản thân",
    subtitle: "Thử phương pháp wellness mới phù hợp với mình",
  },
  {
    value: "sharing",
    icon: "💬",
    title: "Tìm không gian chia sẻ",
    subtitle: "Nơi để giải tỏa cảm xúc không phán xét",
  },
] as const;

const BEDTIME_OPTIONS = [
  { value: "before_22", label: "Trước 22:00" },
  { value: "22_23", label: "22:00 – 23:00" },
  { value: "23_00", label: "23:00 – 00:00" },
  { value: "after_00", label: "Sau 00:00" },
] as const;

const SLEEP_QUALITY_OPTIONS = [
  { value: 1, emoji: "😴", label: "Rất kém" },
  { value: 2, emoji: "😕", label: "Chưa tốt" },
  { value: 3, emoji: "🙂", label: "Tạm ổn" },
  { value: 4, emoji: "😊", label: "Khá tốt" },
  { value: 5, emoji: "✨", label: "Rất tốt" },
] as const;

const MOOD_OPTIONS = [
  { value: "balanced", emoji: "😌", label: "Thoải mái và cân bằng" },
  { value: "slightly_stressed", emoji: "😤", label: "Hơi căng thẳng" },
  { value: "anxious", emoji: "😟", label: "Lo âu thường xuyên" },
  { value: "unmotivated", emoji: "😶", label: "Thiếu động lực" },
  { value: "dysregulated", emoji: "🌀", label: "Khó kiểm soát cảm xúc" },
] as const;

const COMPANION_OPTIONS = [
  {
    value: "digital",
    icon: "💻",
    title: "Hành trình số",
    description:
      "Phân tích dữ liệu, AI Chatbot, âm thanh sóng não - mọi thứ trên thiết bị của bạn.",
    tag: "Gợi ý: LUMIA Digital",
  },
  {
    value: "master",
    icon: "📦",
    title: "Hành trình trọn vẹn",
    description: "Kết hợp công nghệ thông minh với sản phẩm vật lý tại nhà.",
    tag: "Gợi ý: LUMIA Master",
  },
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stepVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

const stepTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-matcha-soft">
      <motion.div
        className="h-full rounded-full bg-matcha-deep"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

function StepLabel({ step, total }: { step: number; total: number }) {
  return (
    <span className="eyebrow mb-3 block text-matcha-deep/70">
      Bước {step}/{total}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  // step 0 = welcome, 1–6 = questions, 7 = final success
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ ...defaultAnswers });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_QUESTION_STEPS = 6;

  function updateAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => s - 1);
  }

  async function submitAnswers(final: Answers) {
    setLoading(true);
    setError(null);

    try {
      localStorage.setItem(
        "lumia-onboarding-hints",
        JSON.stringify({
          bedtime: final.bedtime,
          recentMood: final.recentMood,
          companionMode: final.companionMode,
        }),
      );
    } catch {
      // localStorage may be unavailable in private/incognito mode - non-critical
    }

    try {
      const response = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: final.nickname,
          onboardingGoal: final.motivation,
          onboardingData: {
            motivation: final.motivation,
            bedtime: final.bedtime,
            sleepQuality: final.sleepQuality,
            recentMood: final.recentMood,
            companionMode: final.companionMode,
          },
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Không thể lưu lựa chọn. Vui lòng thử lại.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleSkip() {
    const final: Answers = { ...answers, ...defaultAnswers, nickname: answers.nickname };
    await submitAnswers(final);
  }

  function autoAdvance(callback: () => void) {
    setTimeout(callback, 300);
  }

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  function renderStep0() {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex justify-center gap-4">
          <BotanicalOrb variant="orb" size={52} opacity={0.55} />
          <BotanicalOrb variant="leaves" size={44} opacity={0.45} />
          <BotanicalOrb variant="branch" size={56} opacity={0.4} />
        </div>
        <h1 className="font-serif text-[2rem] leading-tight text-matcha-deep lg:text-[2.4rem]">
          Chào mừng đến với LUMIA 🌿
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          LUMIA được tạo ra để giúp bạn hiểu rõ hơn về tâm trạng, giấc ngủ và sức
          khỏe tinh thần của chính mình.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Trước khi bắt đầu, hãy dành khoảng 1 phút để LUMIA hiểu bạn hơn nhé.
        </p>
        <button type="button" className="button-primary mt-8 w-full" onClick={goNext}>
          Bắt đầu →
        </button>
      </div>
    );
  }

  function renderStep1() {
    const canContinue = answers.nickname.trim().length > 0;
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          LUMIA sẽ gọi bạn là gì?
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Nhập tên hiển thị hoặc biệt danh bạn muốn
        </p>
        <input
          type="text"
          value={answers.nickname}
          onChange={(e) => updateAnswer("nickname", e.target.value)}
          placeholder="Ví dụ: Linh, Minh, An..."
          className="mt-6 w-full rounded-[16px] border border-white/70 bg-white/90 px-5 py-4 text-base text-matcha-deep placeholder-[var(--muted)] outline-none ring-0 transition focus:border-matcha focus:bg-white focus:ring-2 focus:ring-matcha/20"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && canContinue) goNext();
          }}
        />
        <button
          type="button"
          className="button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canContinue || loading}
          onClick={goNext}
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          Điều gì đưa bạn đến với LUMIA?
        </h1>
        <div className="mt-6 space-y-3">
          {MOTIVATION_OPTIONS.map((opt) => {
            const isSelected = answers.motivation === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswer("motivation", opt.value);
                  autoAdvance(goNext);
                }}
                className={`w-full rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] lg:rounded-[24px] ${
                  isSelected
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-white/70 bg-white/80 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl leading-none">{opt.icon}</span>
                  <div>
                    <div className="font-medium text-matcha-deep">{opt.title}</div>
                    <div className="mt-0.5 text-sm text-[var(--muted)]">{opt.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          Bạn thường đi ngủ lúc mấy giờ?
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          {BEDTIME_OPTIONS.map((opt) => {
            const isSelected = answers.bedtime === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswer("bedtime", opt.value);
                  autoAdvance(goNext);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition active:scale-[0.97] ${
                  isSelected
                    ? "border-matcha bg-matcha-soft/30 text-matcha-deep"
                    : "border-white/70 bg-white/80 text-matcha-deep hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          Bạn đánh giá chất lượng giấc ngủ hiện tại như thế nào?
        </h1>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {SLEEP_QUALITY_OPTIONS.map((opt) => {
            const isSelected = answers.sleepQuality === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswer("sleepQuality", opt.value);
                  autoAdvance(goNext);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-[16px] border px-2 py-3 transition active:scale-[0.97] ${
                  isSelected
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-white/70 bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-2xl leading-none">{opt.emoji}</span>
                <span className="text-center text-[11px] font-medium leading-tight text-matcha-deep">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStep5() {
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          Trong 7 ngày gần đây, bạn cảm thấy...
        </h1>
        <div className="mt-6 space-y-3">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = answers.recentMood === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateAnswer("recentMood", opt.value);
                  autoAdvance(goNext);
                }}
                className={`w-full rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] lg:rounded-[24px] ${
                  isSelected
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-white/70 bg-white/80 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{opt.emoji}</span>
                  <span className="font-medium text-matcha-deep">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStep6() {
    return (
      <div>
        <h1 className="font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-[2rem]">
          Bạn muốn LUMIA đồng hành theo phong cách nào?
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          LUMIA sẽ gợi ý gói phù hợp nhất cho bạn
        </p>
        <div className="mt-6 space-y-4">
          {COMPANION_OPTIONS.map((opt) => {
            const isSelected = answers.companionMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const finalAnswers: Answers = { ...answers, companionMode: opt.value };
                  updateAnswer("companionMode", opt.value);
                  autoAdvance(() => {
                    setStep(7);
                    submitAnswers(finalAnswers);
                  });
                }}
                className={`w-full rounded-[20px] border px-5 py-5 text-left transition active:scale-[0.99] lg:rounded-[24px] ${
                  isSelected
                    ? "border-matcha bg-matcha-soft/30"
                    : "border-white/70 bg-white/80 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-2xl leading-none">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-matcha-deep">{opt.title}</div>
                    <p className="mt-1 text-sm leading-snug text-[var(--muted)]">
                      {opt.description}
                    </p>
                    <span className="mt-2.5 inline-block rounded-full bg-matcha-soft/50 px-3 py-0.5 text-xs font-medium text-matcha-deep">
                      {opt.tag}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderFinal() {
    return (
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mb-6 block text-6xl leading-none"
          aria-hidden
        >
          ✨
        </motion.span>
        <h1 className="font-serif text-[1.9rem] leading-tight text-matcha-deep lg:text-[2.2rem]">
          LUMIA đã sẵn sàng đồng hành cùng{" "}
          <span className="underline decoration-matcha-soft decoration-2 underline-offset-4">
            {answers.nickname || "bạn"}
          </span>
          !
        </h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          Hành trình chăm sóc bản thân của bạn bắt đầu từ hôm nay.
        </p>
        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-matcha border-t-transparent" />
            Đang chuẩn bị hành trình của bạn…
          </div>
        ) : (
          <button
            type="button"
            className="button-primary mt-8 w-full"
            onClick={() => router.push("/dashboard")}
            disabled={loading}
          >
            Bắt đầu hành trình →
          </button>
        )}
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  const isFinal = step === 7;
  const isWelcome = step === 0;
  const showProgress = !isWelcome && !isFinal;
  // Back available from step 3 onward per spec (not on step 1 or step 2)
  const showBack = step >= 3 && !isFinal;
  const showSkip = step >= 1 && !isFinal;

  function renderCurrentStep() {
    switch (step) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return renderFinal();
    }
  }

  return (
    <main className="shell flex min-h-[80vh] flex-col justify-center py-10">
      <div className="dash-panel relative mx-auto w-full max-w-lg overflow-hidden p-7 md:p-9">
        <GenerativeVisual seed="onboarding" variant="garden" className="absolute inset-0 opacity-30" />

        <div className="relative z-10">
          {/* Top bar: progress strip + skip link */}
          {(showProgress || showSkip) && (
            <div className="mb-4 flex items-center gap-4">
              {showProgress ? (
                <div className="flex-1">
                  <ProgressBar current={step} total={TOTAL_QUESTION_STEPS} />
                </div>
              ) : (
                <div className="flex-1" />
              )}
              {showSkip && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="shrink-0 text-sm text-[var(--muted)] transition hover:text-matcha-deep disabled:opacity-40"
                >
                  Bỏ qua →
                </button>
              )}
            </div>
          )}

          {/* Step counter label */}
          {showProgress && <StepLabel step={step} total={TOTAL_QUESTION_STEPS} />}

          {/* Animated step content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Back button */}
          {showBack && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              <button type="button" onClick={goBack} className="button-secondary">
                Quay lại
              </button>
            </motion.div>
          )}

          {/* Mid-flow loading indicator */}
          {loading && !isFinal && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-matcha border-t-transparent" />
              Đang lưu lựa chọn của bạn…
            </div>
          )}

          {/* Mid-flow error */}
          {error && !isFinal && <p className="mt-3 text-sm text-error">{error}</p>}
        </div>
      </div>
    </main>
  );
}
