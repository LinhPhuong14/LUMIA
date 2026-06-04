"use client";

import { testimonials } from "@/components/landing/data/landing-content";
import { ScrollColumn } from "@/components/landing/shared/scroll-column";
import { SectionHeading } from "@/components/landing/shared/section-heading";
import { TestimonialCard } from "@/components/landing/shared/testimonial-card";

const col1 = testimonials.slice(0, 3);
const col2 = testimonials.slice(3, 6);
const col3 = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#F8F6EF] px-8 py-28 md:px-10 md:py-32 lg:px-14"
    >      <div className="pointer-events-none absolute left-20 top-[32%] z-20 h-[12rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F4D878]/18 blur-3xl" />
      {/* transition wash từ section trước xuống */}
      <div className="pointer-events-none absolute inset-x-0 top-50 z-10 h-64 bg-gradient-to-b from-[#F8F6EF] via-[#F8F6EF] to-transparent" />
      {/* glow nền chính */}
      <div className="pointer-events-none absolute left-20 top-[32%] z-0 h-[14rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F4D878]/18 blur-3xl" />
      {/* <div className="pointer-events-none absolute left-[18%] top-[28%] z-0 h-72 w-72 rounded-full bg-[#DDE8D2]/45 blur-3xl" /> */}
      <div className="pointer-events-none absolute right-[12%] bottom-[14%] z-0 h-80 w-80 rounded-full bg-[#B8CFA6]/30 blur-3xl" />

      {/* transition wash sang section sau */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 bg-gradient-to-t from-[#FAF6E6] via-[#FAF6E6]/92 to-transparent" />

      <div className="landing-frame relative z-10 w-full">
        <div className="mb-14 flex flex-col items-center text-center">
          <SectionHeading
            eyebrow="LUMIA"
            title="Được yêu mến bởi những LUMIERs."
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1180px]">
          {/* fade che card ở mép trên/dưới scroll wall */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-gradient-to-b from-[#F8F6EF] via-[#F8F6EF]/82 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-[#F8F6EF] via-[#F8F6EF]/82 to-transparent" />

          <div className="h-[600px] md:hidden">
            <div className="relative h-full overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...testimonials, ...testimonials].map((item, index) => (
                  <TestimonialCard
                    key={index}
                    quote={item.quote}
                    tag={item.tag}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden h-[600px] gap-5 md:grid md:grid-cols-3">
            <ScrollColumn items={col1} direction="down" />
            <ScrollColumn items={col2} direction="up" />
            <ScrollColumn items={col3} direction="down" />
          </div>
        </div>
      </div>
    </section>
  );
}