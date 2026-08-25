import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AiListeningSection } from "@/components/landing/sections/ai-listening-section";
import { BlogSection } from "@/components/landing/sections/blog-section";
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
import { SectionSkeleton } from "@/components/landing/shared/section-skeleton";
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

  // Cheap cookie-presence check (no network call) so the navbar shows "Vào
  // Dashboard" instead of "Đăng nhập" when a Supabase session cookie is still
  // present — the user shouldn't have to log in again after landing here with a
  // live session. If the cookie is stale, clicking through hits the proxy which
  // does the real validation.
  const cookieStore = await cookies();
  const isAuthed = cookieStore.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  return (
    <>
      <FloatingNavbar isAuthed={isAuthed} />
      <HeroSection />
      {/*
        HomePage đọc `cookies()` phía trên nên cả route đã là dynamic — không
        cách nào tránh render lại mỗi request. Nhưng PromoSection, Boxes,
        Products, Blog đều phải chờ Supabase, và không có Suspense thì React
        chặn TOÀN BỘ phần HTML còn lại (kể cả những gì tĩnh phía dưới) tới khi
        section chậm nhất xong — biến vài trăm ms mỗi query cộng dồn thành một
        màn hình trắng nhiều giây. Suspense ở đây cho từng section stream
        xuống ngay khi nó xong, độc lập với các section khác.
      */}
      <Suspense fallback={<SectionSkeleton variant="banner" />}>
        <PromoSection hasSessionCookie={isAuthed} />
      </Suspense>
      {/* <CategoriesSection /> */}
      <RitualAccordionSection />
      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <BoxesShowcaseSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton cards={4} />}>
        <ProductsCarouselSection />
      </Suspense>
      <AiListeningSection />
      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <BlogSection />
      </Suspense>
      <WebappDemoSection />
      <TestimonialsSection />
      <QuizSection />
      <JoinSection />
      {/* <FaqSection /> */}
      <SiteFooter />
    </>
  );
}
