"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { landingBoxCards } from "@/components/landing/data/landing-content";
import { BoxShowcaseCard } from "@/components/landing/shared/box-showcase-card";
import { fadeUp } from "@/components/landing/shared/landing-motion";

const GAP_PX = 24;
const AUTO_MS = 5000;

function cardWidthFor(containerWidth: number) {
  if (containerWidth < 480) return Math.min(containerWidth * 0.88, 320);
  if (containerWidth < 768) return 320;
  return 360;
}

export function BoxesShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const [cardWidth, setCardWidth] = useState(360);
  const [activeIndex, setActiveIndex] = useState(2);
  const [canPrev, setCanPrev] = useState(true);
  const [canNext, setCanNext] = useState(true);
  const [paused, setPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const sectionY = useTransform(scrollYProgress, [0, 0.5, 1], [48, 0, -48]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 0.55, 0.55, 0]);
  const glowY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const glowY2 = useTransform(scrollYProgress, [0, 1], [60, -80]);

  const scrollToCenter = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(index, landingBoxCards.length - 1));
    const slides = track.querySelectorAll<HTMLElement>("[data-carousel-slide]");
    const slide = slides[clamped];
    if (!slide) return;

    const left = slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
    const maxScroll = track.scrollWidth - track.clientWidth;

    track.scrollTo({ left: Math.max(0, Math.min(left, maxScroll)), behavior });
    setActiveIndex(clamped);
    setCanPrev(clamped > 0);
    setCanNext(clamped < landingBoxCards.length - 1);
  }, []);

  const syncFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-carousel-slide]"));
    if (!slides.length) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;

    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(slideCenter - trackCenter);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });

    setActiveIndex(nearest);
    setCanPrev(nearest > 0);
    setCanNext(nearest < landingBoxCards.length - 1);
  }, []);

  const pauseAuto = useCallback((ms = AUTO_MS * 2) => {
    pauseUntilRef.current = Date.now() + ms;
    setPaused(true);
    window.setTimeout(() => setPaused(false), ms);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(([entry]) => {
      setCardWidth(cardWidthFor(entry.contentRect.width));
    });
    ro.observe(track);
    setCardWidth(cardWidthFor(track.clientWidth));

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    scrollToCenter(2, "auto");
  }, [cardWidth, scrollToCenter]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;

    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActiveIndex((current) => {
        const next = current >= landingBoxCards.length - 1 ? 0 : current + 1;
        scrollToCenter(next);
        return next;
      });
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [paused, scrollToCenter]);

  const goPrev = () => {
    pauseAuto();
    scrollToCenter(activeIndex - 1);
  };

  const goNext = () => {
    pauseAuto();
    scrollToCenter(activeIndex + 1);
  };

  const navBtnClass =
    "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[var(--green-deep)] shadow-[0_12px_32px_rgba(95,111,82,0.14)] backdrop-blur-md transition enabled:hover:scale-105 enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <section
      ref={sectionRef}
      id="hop-lumia"
      className="relative overflow-hidden py-20 md:py-28 lg:min-h-[95vh] lg:py-36"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[18%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(176,216,166,0.35)_0%,transparent_70%)] blur-2xl"
        style={{ y: glowY1, opacity: glowOpacity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] right-[6%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(240,216,138,0.28)_0%,transparent_70%)] blur-2xl"
        style={{ y: glowY2, opacity: glowOpacity }}
      />

      <div className="landing-frame relative">
        <motion.div
          {...fadeUp()}
          className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 sm:flex-row sm:items-end"
        >
          <div>
            <span className="lumia-kicker">— Hộp LUMIA</span>
            <h2 className="lumia-h2 max-w-[680px]">Chọn chiếc hộp hợp với nhịp chăm sóc của bạn.</h2>
          </div>
          <Link
            href="/boxes"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[var(--green-deep)] transition hover:opacity-80"
          >
            So sánh gói <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div style={{ y: sectionY }} className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-14 items-center justify-start pl-1 md:w-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Gói trước"
              className={navBtnClass}
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-14 items-center justify-end pr-1 md:w-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Gói tiếp theo"
              className={navBtnClass}
            >
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
              pauseUntilRef.current = Date.now() + 800;
              setPaused(false);
            }}
          >
            <div
              ref={trackRef}
              onScroll={syncFromScroll}
              onTouchStart={() => pauseAuto()}
              style={
                {
                  "--carousel-card-width": `${cardWidth}px`,
                  "--carousel-card-half": `${cardWidth / 2}px`,
                  "--carousel-gap": `${GAP_PX}px`,
                } as CSSProperties
              }
              className="landing-box-carousel landing-box-carousel--center flex overflow-x-auto scroll-smooth py-4 md:py-6"
              aria-roledescription="carousel"
              aria-label="Các gói LUMIA"
            >
              {landingBoxCards.map((box, index) => (
                <div
                  key={box.slug}
                  data-carousel-slide
                  data-index={index}
                  className="landing-box-carousel__slide"
                  onMouseEnter={() => {
                    pauseAuto();
                    scrollToCenter(index);
                  }}
                  onFocus={() => scrollToCenter(index)}
                >
                  <BoxShowcaseCard
                    box={box}
                    isActive={index === activeIndex}
                    scrollYProgress={scrollYProgress}
                    parallaxOffset={index * 6}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <p className="mr-2 text-[13px] text-[var(--muted)]">{landingBoxCards.length} gói LUMIA</p>
            {landingBoxCards.map((box, i) => (
              <button
                key={box.slug}
                type="button"
                aria-label={`Xem gói ${box.name}`}
                onClick={() => {
                  pauseAuto();
                  scrollToCenter(i);
                }}
                className={`rounded-full transition-all ${
                  i === activeIndex
                    ? "h-2 w-8 bg-[var(--green)]"
                    : "h-2 w-2 bg-[var(--border)] hover:bg-[var(--green)]/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
