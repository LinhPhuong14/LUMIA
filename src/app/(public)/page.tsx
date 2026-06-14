import { AiListeningSection } from "@/components/landing/sections/ai-listening-section";
import { BoxesShowcaseSection } from "@/components/landing/sections/boxes-showcase-section";
import { CategoriesSection } from "@/components/landing/sections/categories-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { JoinSection } from "@/components/landing/sections/join-section";
import { RitualAccordionSection } from "@/components/landing/sections/ritual-accordion-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { WebappDemoSection } from "@/components/landing/sections/webapp-demo-section";
import { FloatingNavbar } from "@/components/landing/shared/floating-navbar";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function HomePage() {
  return (
    <>
      <FloatingNavbar />
      <HeroSection />
      <CategoriesSection />
      <RitualAccordionSection />
      <BoxesShowcaseSection />
      <AiListeningSection />
      <WebappDemoSection />
      <TestimonialsSection />
      <JoinSection />
      <SiteFooter />
    </>
  );
}
