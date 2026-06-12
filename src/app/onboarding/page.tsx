"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { AmbientBackground } from "@/components/ui/ambient-background";
import { GenerativeVisual } from "@/components/ui/generative-visual";
import { BotanicalOrb } from "@/components/landing/botanical/botanical-orb";

const steps = [
  {
    id: "goal",
    title: "Bạn muốn cải thiện điều gì?",
    illustration: "goals",
    options: [
      { id: "sleep", label: "Ngủ tốt hơn", value: "sleep", icon: "moon" },
      { id: "stress", label: "Giảm stress", value: "stress", icon: "lotus" },
      { id: "meditation", label: "Tập thiền", value: "meditation", icon: "mandala" },
    ],
    persist: true,
  },
  {
    id: "bedtime",
    title: "Bạn thường thức đến mấy giờ?",
    illustration: "clock",
    options: [
      { id: "early", label: "Trước 22h", value: "early" },
      { id: "mid", label: "22h – 0h", value: "mid" },
      { id: "late", label: "Sau 0h", value: "late" },
    ],
    persist: false,
  },
  {
    id: "experience",
    title: "Bạn đã từng thiền chưa?",
    illustration: "growth",
    options: [
      { id: "never", label: "Chưa bao giờ", value: "never" },
      { id: "sometimes", label: "Đôi khi", value: "sometimes" },
      { id: "often", label: "Thường xuyên", value: "often" },
    ],
    persist: false,
  },
] as const;

function StepIllustration({ type }: { type: string }) {
  if (type === "goals") {
    return (
      <div className="mb-6 flex justify-center gap-6">
        <BotanicalOrb variant="orb" size={48} opacity={0.5} />
        <BotanicalOrb variant="leaves" size={48} opacity={0.5} />
        <BotanicalOrb variant="branch" size={56} opacity={0.4} />
      </div>
    );
  }
  if (type === "clock") {
    return (
      <svg className="mx-auto mb-6 h-16 w-16" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="none" stroke="#7d8f68" strokeWidth="1.5" opacity="0.5" />
        <path d="M32 32 L32 18 M32 32 L42 36" stroke="#7d8f68" strokeWidth="1.5" />
        <path d="M28 12 C30 8 34 8 36 12" fill="#8d9d76" opacity="0.5" />
      </svg>
    );
  }
  return (
    <div className="mb-6 flex items-end justify-center gap-3">
      {[16, 28, 40].map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
          className="w-4 rounded-t-full bg-matcha-soft"
          style={{ height: h, transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

function SeedProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-full transition ${
            i <= current ? "bg-matcha-deep scale-110" : "bg-matcha-soft/60"
          }`}
          style={{ borderRadius: i <= current ? "40% 60% 50% 50%" : "50%" }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const current = steps[step];
  const selected = answers[current.id];

  async function finish(allAnswers: Record<string, string>) {
    setLoading(true);
    setError(null);

    sessionStorage.setItem(
      "lumia-onboarding-hints",
      JSON.stringify({
        bedtime: allAnswers.bedtime,
        experience: allAnswers.experience,
      }),
    );

    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingGoal: allAnswers.goal }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Không thể lưu lựa chọn.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  function onSelect(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish({ goal: next.goal ?? value, bedtime: next.bedtime, experience: next.experience });
    }
  }

  return (
    <div className="marketing-page page-scroll-area relative flex h-full flex-col justify-end px-4 pb-[calc(var(--safe-bottom)+1.5rem)] pt-8 lg:items-center lg:justify-center lg:py-10">
      <AmbientBackground timeAware />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated relative w-full max-w-2xl overflow-hidden rounded-t-[28px] p-6 lg:rounded-[30px] lg:p-8"
      >
        <GenerativeVisual seed="onboarding" variant="garden" className="absolute inset-0 opacity-40" />
        <div className="relative z-10">
          <SeedProgress current={step} total={steps.length} />
          <span className="eyebrow">
            Bước {step + 1}/{steps.length}
          </span>
          <StepIllustration type={current.illustration} />
          <h1 className="mt-2 font-serif text-[1.75rem] leading-tight text-matcha-deep lg:text-4xl">{current.title}</h1>

          <div className="mt-6 space-y-3 lg:mt-8">
            {current.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.value)}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={loading}
                className={`relative min-h-[52px] w-full overflow-hidden rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] disabled:opacity-50 lg:rounded-[24px] ${
                  selected === option.value
                    ? "border-matcha bg-matcha-soft/40"
                    : "border-white/70 bg-white/80 hover:bg-white"
                }`}
              >
                {hoveredOption === option.id || selected === option.value ? (
                  <BotanicalOrb variant="leaves" size={28} opacity={0.2} className="absolute right-3 top-2" />
                ) : null}
                <div className="font-medium text-matcha-deep">{option.label}</div>
              </button>
            ))}
          </div>

          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="button-secondary mt-6">
              Quay lại
            </button>
          ) : null}

          {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        </div>
      </motion.div>
    </div>
  );
}
