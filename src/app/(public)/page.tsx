import { redirect } from "next/navigation";

import { AiListeningSection } from "@/components/landing/sections/ai-listening-section";
// import { BlogSection } from "@/components/landing/sections/blog-section";
import { BoxesShowcaseSection } from "@/components/landing/sections/boxes-showcase-section";
// import { CategoriesSection } from "@/components/landing/sections/categories-section";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { JoinSection } from "@/components/landing/sections/join-section";
import { PromoSection } from "@/components/landing/sections/promo-section";
import { ProductsCarouselSection } from "@/components/landing/sections/products-carousel-section";
import { QuizSection } from "@/components/landing/sections/quiz-section";
import { RitualAccordionSection } from "@/components/landing/sections/ritual-accordion-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { WebappDemoSection } from "@/components/landing/sections/webapp-demo-section";
import { FloatingNavbar } from "@/components/landing/shared/floating-navbar";
import { FaqSection } from "@/components/marketing/faq-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;

  // Safety net: if Supabase OAuth fell back to the Site URL (this landing page)
  // instead of /auth/callback, forward the code so login still completes.
  if (params.code) {
    const next = params.next ?? "/dashboard";
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=${encodeURIComponent(next)}`);
  }
  if (params.error) {
    const reason = params.error === "access_denied" ? "oauth_denied" : "oauth_failed";
    redirect(`/login?error=${reason}`);
  }

  return (
    <>
      <FloatingNavbar />
      <HeroSection />
      <PromoSection />
      {/* <CategoriesSection /> */}
      <RitualAccordionSection />
      <BoxesShowcaseSection />
      <ProductsCarouselSection />
      <AiListeningSection />
      <WebappDemoSection />
      <TestimonialsSection />
      {/* <BlogSection /> */}
      <QuizSection />
      <JoinSection />
      {/* <FaqSection /> */}
      <SiteFooter />
    </>
  );
}
