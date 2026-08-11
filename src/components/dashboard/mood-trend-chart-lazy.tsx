"use client";

import dynamic from "next/dynamic";

import { MoodTrendChartSkeleton } from "@/components/dashboard/mood-trend-chart-skeleton";

/**
 * Recharts được tải riêng, không nằm trong gói JS đầu tiên của `/dashboard`.
 *
 * Biểu đồ này nằm trên màn hình đầu tiên sau khi đăng nhập, và recharts là thư
 * viện nặng nhất trong toàn bộ client bundle (~340KB chưa nén). Trước đây nó là
 * import tĩnh nên mọi người dùng phải tải và phân tích cú pháp toàn bộ recharts
 * TRƯỚC khi trang có thể tương tác — kể cả người chưa từng cuộn xuống chỗ biểu đồ.
 *
 * `ssr: false` vì recharts đo kích thước container để vẽ, nên bản dựng trên máy
 * chủ luôn ra khung rỗng rồi vẽ lại ở client — trả tiền hai lần cho một hình.
 */
export const MoodTrendChartLazy = dynamic(
  () => import("@/components/dashboard/mood-trend-chart").then((m) => m.MoodTrendChart),
  {
    ssr: false,
    // Khung giữ chỗ đúng chiều cao biểu đồ: thiếu nó thì nội dung bên dưới nhảy
    // lên rồi tụt xuống khi chart tải xong, và đó chính là cảm giác "lag".
    loading: () => <MoodTrendChartSkeleton />,
  },
);
