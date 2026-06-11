import { AiListeningSection } from "@/components/landing/sections/ai-listening-section";
import { BoxesShowcaseSection } from "@/components/landing/sections/boxes-showcase-section";
import { FooterSection } from "@/components/landing/sections/footer-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { JoinSection } from "@/components/landing/sections/join-section";
import { RitualStepsSection } from "@/components/landing/sections/ritual-steps-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { FloatingNavbar } from "@/components/landing/shared/floating-navbar";

export default function HomePage() {
  return (
    <div className="landing-page page-scroll-area h-full">
      <FloatingNavbar />
      <HeroSection />
      <RitualStepsSection />
      <BoxesShowcaseSection />
      <AiListeningSection />
      <TestimonialsSection />
      <JoinSection />
      <FooterSection />
    </div>
  );
}
