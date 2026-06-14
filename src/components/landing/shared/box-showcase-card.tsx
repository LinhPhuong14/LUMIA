"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { motion, type MotionValue, useTransform } from "framer-motion";

import type { LandingBoxCard } from "@/components/landing/data/landing-content";
import { PhotoImage, PRODUCT_STOCK_QUERIES } from "@/components/ui/photo-image";
import { cn } from "@/lib/utils";

function ParallaxCardImage({
  stockQuery,
  alt,
  overlayOpacity,
  gradient,
  scrollYProgress,
  parallaxOffset,
}: {
  stockQuery: string;
  alt: string;
  overlayOpacity: number;
  gradient: string;
  scrollYProgress: MotionValue<number>;
  parallaxOffset: number;
}) {
  const imageY = useTransform(scrollYProgress, [0, 1], [24 + parallaxOffset, -24 - parallaxOffset]);

  return (
    <>
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <PhotoImage
          stockQuery={stockQuery}
          alt={alt}
          fill
          overlay="matcha"
          overlayOpacity={overlayOpacity}
          className="h-[115%] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 35%, ${gradient} 100%)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{ background: gradient }}
        aria-hidden
      />
    </>
  );
}

export function BoxShowcaseCard({
  box,
  className,
  isActive = false,
  scrollYProgress,
  parallaxOffset = 0,
}: {
  box: LandingBoxCard;
  className?: string;
  isActive?: boolean;
  scrollYProgress?: MotionValue<number>;
  parallaxOffset?: number;
}) {
  const Icon = box.icon;
  const stockQuery = PRODUCT_STOCK_QUERIES[box.photoTier] ?? "wellness gift box";

  return (
    <motion.article
      animate={{
        y: isActive ? -8 : 0,
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex h-full w-full min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-[var(--surface-card)]",
        box.featured
          ? "ring-[1.5px] ring-[var(--green)]/80 shadow-[0_28px_56px_rgba(122,140,82,0.22)]"
          : "border border-[var(--border)] shadow-[0_16px_40px_rgba(95,111,82,0.1)]",
        isActive && "shadow-[0_32px_64px_rgba(122,140,82,0.18)]",
        className,
      )}
    >
      <div className="relative h-[240px] shrink-0 overflow-hidden md:h-[260px]">
        {scrollYProgress ? (
          <ParallaxCardImage
            stockQuery={stockQuery}
            alt={box.name}
            overlayOpacity={box.featured ? 0.28 : 0.18}
            gradient={box.gradient}
            scrollYProgress={scrollYProgress}
            parallaxOffset={parallaxOffset}
          />
        ) : (
          <>
            <PhotoImage
              stockQuery={stockQuery}
              alt={box.name}
              fill
              overlay="matcha"
              overlayOpacity={box.featured ? 0.28 : 0.18}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `linear-gradient(180deg, transparent 35%, ${box.gradient} 100%)` }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
              style={{ background: box.gradient }}
              aria-hidden
            />
          </>
        )}
        <div className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/75 shadow-[0_8px_24px_rgba(95,111,82,0.12)] backdrop-blur-md">
          <Icon className="h-5 w-5 text-[var(--green-deep)]" strokeWidth={1.6} />
        </div>
        {box.badge ? (
          <span className="absolute right-3 top-3 z-10 rounded-full border border-white/40 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--green-deep)] backdrop-blur-sm">
            {box.badge}
          </span>
        ) : null}
        {box.featured ? (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-[var(--green)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(122,140,82,0.35)]">
            Phổ biến
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--title-primary)] md:text-[24px]">
              {box.name}
            </h3>
            <p className="mt-1 text-[12px] font-medium text-[var(--green)]">{box.tagline}</p>
          </div>
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-wash)] text-[var(--green-deep)] opacity-0 transition group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3 flex items-end gap-1.5">
          <span className="font-serif text-[26px] font-semibold leading-none text-[var(--green-deep)] md:text-[28px]">
            {box.price}
          </span>
          <span className="pb-0.5 text-[12px] text-[var(--muted)]">/ {box.per}</span>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">{box.blurb}</p>

        <ul className="mt-4 space-y-2 border-t border-[var(--border)]/60 pt-4">
          {box.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[12.5px] leading-snug text-[var(--foreground)]/85">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" strokeWidth={2.5} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[11.5px] italic leading-relaxed text-[var(--muted)]">{box.idealFor}</p>

        <Link
          href={`/boxes/${box.slug}`}
          className={cn(
            "mt-auto flex w-full items-center justify-center rounded-full py-3.5 text-[13px] font-semibold transition",
            box.featured
              ? "bg-[var(--green)] text-white shadow-[0_12px_28px_rgba(122,140,82,0.32)] hover:brightness-105"
              : "border border-[var(--border)] bg-[var(--surface-warm)] text-[var(--green-deep)] hover:bg-[var(--green-wash)]",
          )}
        >
          Chọn gói
        </Link>
      </div>
    </motion.article>
  );
}
