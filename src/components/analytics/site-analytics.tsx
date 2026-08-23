import { Suspense } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { OAuthSignupTracker } from "@/components/analytics/oauth-signup-tracker";
import { VercelAnalytics } from "@/components/analytics/vercel-analytics";

/** Điểm gắn duy nhất cho toàn bộ analytics của site — dùng trong root layout. */
export function SiteAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <VercelAnalytics />
      {/* useSearchParams buộc phải nằm trong Suspense, nếu không cả cây bị
          bail-out sang client render. */}
      <Suspense fallback={null}>
        <OAuthSignupTracker />
      </Suspense>
    </>
  );
}
