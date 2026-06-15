"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LandingBoxCard } from "@/components/landing/data/landing-content";
import { LandingPricingTier } from "@/components/landing/shared/landing-pricing-tier";
import { cn } from "@/lib/utils";

export function LandingPricingCarousel({
  boxes,
  className,
}: {
  boxes: readonly LandingBoxCard[];
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;

    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;

    let closest = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncActiveIndex();
    track.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => track.removeEventListener("scroll", syncActiveIndex);
  }, [syncActiveIndex]);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div className={cn("landing-pricing-carousel-wrap", className)}>
      <div ref={trackRef} className="landing-pricing-carousel" aria-label="Danh sách gói LUMIA">
        {boxes.map((box) => (
          <div key={box.slug} className="landing-pricing-carousel__slide">
            <LandingPricingTier box={box} />
          </div>
        ))}
      </div>
      <div className="landing-pricing-carousel-dots" role="tablist" aria-label="Chọn gói hiển thị">
        {boxes.map((box, index) => (
          <button
            key={box.slug}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`Xem gói ${box.name}`}
            className={cn(
              "landing-pricing-carousel-dot",
              activeIndex === index && "landing-pricing-carousel-dot--active",
            )}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
      <p className="landing-pricing-carousel-hint">Vuốt ngang để xem các gói khác</p>
    </div>
  );
}
