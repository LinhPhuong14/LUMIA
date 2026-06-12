"use client";

import { testimonials } from "@/components/landing/data/landing-content";
import { ScrollColumn } from "@/components/landing/shared/scroll-column";

const col1 = testimonials.slice(0, 3);
const col2 = testimonials.slice(3, 6);
const col3 = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section id="cau-chuyen" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-[8%] top-[26%] h-[220px] w-[480px] rounded-full blur-[60px]"
        style={{ background: "rgba(255,220,138,0.22)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[12%] right-[10%] h-[320px] w-[320px] rounded-full blur-[60px]"
        style={{ background: "rgba(176,216,166,0.3)" }}
        aria-hidden
      />

      <div className="landing-frame relative py-16">
        <div className="mb-9 text-center">
          <span className="lumia-kicker">— Câu chuyện</span>
          <h2 className="lumia-h2 mx-auto max-w-none">Được yêu mến bởi những LUMIERs.</h2>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[110px]"
            style={{ background: "linear-gradient(180deg, var(--background) 12%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[110px]"
            style={{ background: "linear-gradient(0deg, var(--background) 12%, transparent 100%)" }}
          />

          <div className="hidden h-[540px] gap-4 md:grid md:grid-cols-3">
            <ScrollColumn items={col1} direction="down" duration="42s" />
            <ScrollColumn items={col2} direction="up" duration="36s" />
            <ScrollColumn items={col3} direction="down" duration="46s" />
          </div>

          <div className="h-[540px] md:hidden">
            <ScrollColumn items={testimonials} direction="down" duration="40s" />
          </div>
        </div>
      </div>
    </section>
  );
}
