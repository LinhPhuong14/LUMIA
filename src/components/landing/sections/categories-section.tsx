"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { categoryCards } from "@/components/landing/data/landing-content";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function CategoriesSection() {
  return (
    <section className="relative z-10 bg-[var(--background)] py-16">
      <div className="landing-frame">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="lumia-kicker">— Không gian LUMIA</span>
            <h2 className="lumia-h2">Bốn lối nhỏ để trở về với chính mình.</h2>
          </div>
          <Link
            href="/audio"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[var(--green-deep)]"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                {...fadeUp(index * 0.06)}
                className="lumia-magnetic overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_14px_34px_rgba(95,111,82,0.1)]"
              >
                <div
                  className="lumia-grain relative flex h-[168px] items-center justify-center"
                  style={{ background: card.gradient }}
                >
                  <div
                    className="absolute left-[18%] top-[16%] h-[30%] w-[44%] rounded-full blur-[4px]"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)" }}
                    aria-hidden
                  />
                  <Icon className="relative z-10 h-[42px] w-[42px] text-white/95" strokeWidth={1.4} />
                </div>
                <div className="px-5 pb-5 pt-4">
                  <h3 className="font-serif text-[22px] font-semibold text-[var(--foreground)]">{card.title}</h3>
                  <p className="mt-1.5 text-[13px] text-[var(--muted)]">{card.subtitle}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
