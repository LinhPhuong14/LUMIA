import type { Testimonial } from "@/components/landing/data/landing-content";
import { TestimonialCard } from "@/components/landing/shared/testimonial-card";

export function ScrollColumn({
  items,
  direction,
  duration = "40s",
}: {
  items: Testimonial[];
  direction: "up" | "down";
  duration?: string;
}) {
  const animClass = direction === "up" ? "lp-scroll-up" : "lp-scroll-down";

  return (
    <div className="lp-col relative h-full overflow-hidden">
      <div className={animClass} style={{ animationDuration: duration }}>
        {[...items, ...items].map((item, index) => (
          <TestimonialCard key={index} quote={item.quote} tag={item.tag} />
        ))}
      </div>
    </div>
  );
}
