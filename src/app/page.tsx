import { AiListeningSection } from "@/components/landing/sections/ai-listening-section";
import { BoxesShowcaseSection } from "@/components/landing/sections/boxes-showcase-section";
import { CategoriesSection } from "@/components/landing/sections/categories-section";
import { FooterSection } from "@/components/landing/sections/footer-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { JoinSection } from "@/components/landing/sections/join-section";
import { MobileDemoSection } from "@/components/landing/sections/mobile-demo-section";
import { RitualAccordionSection } from "@/components/landing/sections/ritual-accordion-section";
import { StatsSection } from "@/components/landing/sections/stats-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { WebappDemoSection } from "@/components/landing/sections/webapp-demo-section";
import { FloatingNavbar } from "@/components/landing/shared/floating-navbar";

export default function HomePage() {
  return (
    <>
      <FloatingNavbar />
      <div className="landing-page page-scroll-area h-full">
        <HeroSection />
        <CategoriesSection />
        <RitualAccordionSection />
        <BoxesShowcaseSection />
        <AiListeningSection />
        <StatsSection />
        <WebappDemoSection />
        <MobileDemoSection />
        <TestimonialsSection />
        <JoinSection />
        <FooterSection />
      </div>
    </>
  );
}
