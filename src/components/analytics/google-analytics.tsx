import { Suspense } from "react";
import Script from "next/script";

import { GaPageViewTracker } from "@/components/analytics/ga-page-view-tracker";
import { isValidGaId } from "@/lib/analytics";
import { env, isAnalyticsEnabled } from "@/lib/env";

export function GoogleAnalytics() {
  const gaId = env.NEXT_PUBLIC_GA_ID?.trim();

  if (!isAnalyticsEnabled() || !isValidGaId(gaId)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
      {/* useSearchParams buộc phải nằm trong Suspense, nếu không cả cây bị bail-out sang CSR. */}
      <Suspense fallback={null}>
        <GaPageViewTracker />
      </Suspense>
    </>
  );
}
