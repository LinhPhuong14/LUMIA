"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { landingBoxCards } from "@/components/landing/data/landing-content";
import { LandingPricingCarousel } from "@/components/landing/shared/landing-pricing-carousel";
import { LandingPricingTier } from "@/components/landing/shared/landing-pricing-tier";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function BoxesShowcaseSection() {
  return (
    <section id="goi-lumia" className="relative overflow-hidden py-20 md:py-28">
      <div className="landing-frame relative">
        <motion.div
          {...fadeUp()}
          className="mb-8 flex flex-col items-start justify-between gap-6 md:mb-10 sm:flex-row sm:items-end"
        >
          <div>
            <span className="lumia-kicker">- Gói LUMIA</span>
            <h2 className="lumia-h2 max-w-[680px]">Chọn gói thành viên phù hợp với nhịp sống của bạn.</h2>
          </div>
          <Link
            href="/boxes"
            className="lumia-section-link inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition hover:opacity-90"
          >
            So sánh gói <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      <div className="landing-pricing-shell">
        <div className="landing-pricing-row hidden md:grid">
          {landingBoxCards.map((box) => (
            <LandingPricingTier key={box.slug} box={box} />
          ))}
        </div>
        <LandingPricingCarousel boxes={landingBoxCards} className="md:hidden" />
      </div>
    </section>
  );
}
