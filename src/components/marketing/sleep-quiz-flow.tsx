"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { AmbientBackground } from "@/components/ui/ambient-background";
import { getProductBySlug } from "@/data/catalog";
import {
  recommendPackage,
  sleepQuizSteps,
  type SleepQuizAnswers,
} from "@/lib/sleep-quiz";
import { formatCurrency } from "@/lib/utils";

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-full transition ${
            i <= current ? "scale-110 bg-[var(--lumia-green)]" : "bg-[var(--lumia-green-soft)]"
          }`}
        />
      ))}
    </div>
  );
}

export function SleepQuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SleepQuizAnswers>>({});
  const [done, setDone] = useState(false);

  const current = sleepQuizSteps[step];
  const selected = current ? answers[current.id] : undefined;

  function onSelect(value: SleepQuizAnswers[keyof SleepQuizAnswers]) {
    if (!current) return;
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    if (step < sleepQuizSteps.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  if (done) {
    const rec = recommendPackage(answers);
    const product = getProductBySlug(rec.slug);

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated relative w-full max-w-2xl overflow-hidden rounded-[30px] p-8"
      >
        <span className="eyebrow">Kết quả phân tích</span>
        <h1 className="mt-4 font-serif text-3xl font-bold text-[var(--title-primary)]">
          Đây là Gói LUMIA phù hợp nhất với dữ liệu tâm lý của bạn.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--lumia-text-mid)]">{rec.reason}</p>

        {product ? (
          <div className="mt-8 rounded-[24px] border border-[var(--lumia-green-soft)] bg-surface-card p-6 shadow-[0_4px_20px_rgba(45,58,40,0.06)]">
            <h2 className="text-xl font-bold text-[var(--title-primary)]">{product.name}</h2>
            <p className="mt-1 text-sm text-[var(--lumia-text-soft)]">{product.duration}</p>
            <p className="price-amount mt-4">{formatCurrency(product.price)}</p>
            {product.savingsNote ? (
              <p className="mt-1 text-sm font-medium text-[var(--lumia-green)]">{product.savingsNote}</p>
            ) : null}
            <ul className="mt-4 space-y-2 text-sm text-[var(--lumia-text-mid)]">
              {product.features.slice(0, 3).map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="feature-check">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/boxes/${rec.slug}`} className="button-primary text-[13px]">
            Xem gói đề xuất
          </Link>
          <Link href="/store?onboarding=1" className="button-secondary text-[13px]">
            So sánh tất cả gói
          </Link>
          <Link href="/register?next=/dashboard" className="text-sm font-semibold text-[var(--lumia-green)] underline">
            Dùng thử miễn phí trước
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card-elevated relative w-full max-w-2xl overflow-hidden rounded-[30px] p-8"
    >
      <ProgressDots current={step} total={sleepQuizSteps.length} />
      <span className="eyebrow">
        Bước {step + 1}/{sleepQuizSteps.length}
      </span>
      <h1 className="mt-3 font-serif text-[1.75rem] font-bold leading-tight text-[var(--title-primary)] lg:text-4xl">
        {current.title}
      </h1>

      <div className="mt-6 space-y-3">
        {current.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`min-h-[52px] w-full rounded-[20px] border px-5 py-4 text-left transition active:scale-[0.99] ${
              selected === option.value
                ? "border-[var(--lumia-green)] bg-[var(--lumia-green-bg)]"
                : "border-[var(--lumia-green-soft)] bg-surface-card hover:bg-[var(--lumia-green-bg)]/50"
            }`}
          >
            <div className="font-semibold text-[var(--title-primary)]">{option.label}</div>
          </button>
        ))}
      </div>

      {step > 0 ? (
        <button type="button" onClick={() => setStep(step - 1)} className="button-secondary mt-6">
          Quay lại
        </button>
      ) : null}
    </motion.div>
  );
}
