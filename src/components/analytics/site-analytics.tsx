import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { VercelAnalytics } from "@/components/analytics/vercel-analytics";

/** Điểm gắn duy nhất cho toàn bộ analytics của site — dùng trong root layout. */
export function SiteAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <VercelAnalytics />
    </>
  );
}
