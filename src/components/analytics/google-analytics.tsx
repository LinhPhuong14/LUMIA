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
      {/*
        Shim phải chạy lúc parse HTML, KHÔNG phải qua next/script.
        `strategy="afterInteractive"` chỉ chèn script sau khi hydrate, trong khi
        GaPageViewTracker bắn page_view ngay trong useEffect lúc hydrate. Effect
        chạy trước thì `window.gtag` chưa tồn tại, `trackPageView()` trả false và
        nuốt luôn event — mà vì `send_page_view: false` nên đó là event DUY NHẤT
        của lượt tải trang. Kết quả: GA4 không nhận được gì cả, kể cả session.

        Thẻ script thường nằm sẵn trong HTML thì chạy xong trước khi React hydrate,
        nên gtag luôn sẵn sàng. Lệnh gọi sớm xếp hàng trong dataLayer và gtag.js
        phát lại khi nạp xong — đúng cơ chế snippet gốc của Google.

        gaId đã qua isValidGaId (chỉ /^G-[A-Z0-9]{4,}$/i) nên nội suy vào đây an toàn.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            `window.dataLayer=window.dataLayer||[];` +
            `function gtag(){dataLayer.push(arguments);}` +
            `gtag('js',new Date());` +
            `gtag('config','${gaId}',{send_page_view:false});`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      {/* useSearchParams buộc phải nằm trong Suspense, nếu không cả cây bị bail-out sang CSR. */}
      <Suspense fallback={null}>
        <GaPageViewTracker />
      </Suspense>
    </>
  );
}
