"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ritualStageVideoSrc, ritualStages } from "@/components/landing/data/landing-content";

export function RitualAccordionSection() {
  const [active, setActive] = useState(1);

  return (
    <section id="nghi-thuc" className="py-14">
      <div className="landing-frame">
        <div className="mb-8">
          <span className="lumia-kicker">— Nghi thức mỗi tối</span>
          <h2 className="lumia-h2">Năm bước nhỏ, dẫn bạn vào giấc ngủ.</h2>
        </div>

        <div className="hidden h-[380px] gap-3 md:flex">
          {ritualStages.map((stage) => {
            const on = active === stage.id;
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActive(stage.id)}
                className="relative shrink cursor-pointer overflow-hidden rounded-[26px] bg-[var(--surface-warm)] transition-[width,box-shadow] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: on ? "52%" : "12%",
                  boxShadow: on
                    ? "0 24px 60px rgba(122,140,82,0.2)"
                    : "0 10px 24px rgba(122,140,82,0.1)",
                }}
              >
                <div className="lumia-grain-soft absolute inset-0 overflow-hidden bg-[var(--surface-warm)]">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                    src={ritualStageVideoSrc}
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 z-[1]"
                  style={{
                    background: on
                      ? "linear-gradient(180deg, rgba(38,46,32,0.12) 0%, transparent 32%, transparent 48%, rgba(38,46,32,0.72) 100%)"
                      : "linear-gradient(180deg, rgba(38,46,32,0.2) 0%, transparent 28%, transparent 38%, rgba(38,46,32,0.88) 100%)",
                  }}
                />
                <div className="absolute left-5 top-[18px] z-[5] text-[14.4px] font-bold tracking-wider text-white drop-shadow-md">
                  0{stage.id}
                </div>
                {!on ? (
                  <div className="pointer-events-none absolute inset-0 z-[5] flex items-end justify-center pb-7">
                    <span
                      className="font-serif text-[24px] font-semibold tracking-wide text-white"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        textShadow: "0 2px 14px rgba(20,28,18,0.75)",
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                ) : null}
                <AnimatePresence>
                  {on ? (
                    <motion.div
                      key={`content-${stage.id}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[5] flex flex-col justify-end p-7 text-left"
                    >
                      <div className="mb-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/40 bg-white/20 backdrop-blur-md">
                        <Icon className="h-[26px] w-[26px] text-white" strokeWidth={1.6} />
                      </div>
                      <h3 className="font-serif text-[40.8px] font-semibold leading-[1.08] tracking-[-0.02em] text-white drop-shadow-md">
                        {stage.title}
                      </h3>
                      <p className="mt-2.5 max-w-[420px] text-[18px] leading-relaxed text-white/95 drop-shadow-sm">
                        {stage.copy}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {ritualStages.map((stage) => {
            const Icon = stage.icon;
            const on = active === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActive(stage.id)}
                className="relative overflow-hidden rounded-[22px] text-left"
              >
                {on ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                    src={ritualStageVideoSrc}
                  />
                ) : null}
                <div
                  className={`relative p-5 ${on ? "bg-gradient-to-t from-[rgba(38,46,32,0.82)] via-[rgba(38,46,32,0.45)] to-transparent text-white" : "lumia-glass"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${on ? "text-white" : "text-[var(--green-deep)]"}`} />
                    <span className={`font-serif text-[21.6px] ${on ? "text-white" : "text-[var(--foreground)]"}`}>
                      {on ? stage.title : stage.label}
                    </span>
                  </div>
                  {on ? <p className="mt-2 text-[16.8px] leading-relaxed text-white/90">{stage.copy}</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
