import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { isAnalyticsEnabled } from "@/lib/env";

/**
 * Vercel Web Analytics + Speed Insights.
 * Cả hai tự no-op khi chạy ngoài Vercel, nên không cần env riêng để bật/tắt.
 */
export function VercelAnalytics() {
  if (!isAnalyticsEnabled()) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
