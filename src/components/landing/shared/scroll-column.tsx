import type { Testimonial } from "@/components/landing/data/landing-content";
import { TestimonialCard } from "@/components/landing/shared/testimonial-card";

export function ScrollColumn({
  items,
  direction,
}: {
  items: Testimonial[];
  direction: "up" | "down";
}) {
  const animClass =
    direction === "up"
      ? "animate-scroll-up hover:animate-scroll-up-slow"
      : "animate-scroll-down hover:animate-scroll-down-slow";

  return (
    <div className="relative overflow-hidden">
      <div className={animClass}>
        {[...items, ...items].map((item, index) => (
          <TestimonialCard key={index} quote={item.quote} tag={item.tag} />
        ))}
      </div>
    </div>
  );
}
