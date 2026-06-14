"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { categoryCards } from "@/components/landing/data/landing-content";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function CategoriesSection() {
  return (
    <section className="relative z-10 bg-[var(--landing-section-bg)] py-16">
      <div className="landing-frame">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="lumia-kicker">- Không gian LUMIA</span>
            <h2 className="lumia-h2">Bốn lối nhỏ để trở về với chính mình.</h2>
          </div>
          <Link
            href="/audio"
            className="lumia-section-link inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((card, index) => (
            <motion.article
              key={card.title}
              {...fadeUp(index * 0.06)}
              className="lumia-magnetic overflow-hidden rounded-[26px] border border-[rgba(180,200,163,0.5)] bg-[var(--surface-card)] shadow-[0_4px_20px_rgba(45,58,40,0.06)]"
            >
              <div className="relative h-[168px] overflow-hidden">
                <Image
                  src={card.imageSrc}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(255,255,255,0.12)_100%)]"
                  aria-hidden
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="font-serif text-[22px] font-bold text-[var(--title-primary)]">{card.title}</h3>
                <p className="mt-1.5 text-[13px] text-[var(--muted)]">{card.subtitle}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
