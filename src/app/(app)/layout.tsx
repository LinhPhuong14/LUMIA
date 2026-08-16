import type { ReactNode } from "react";

import { AudioPlayerProvider } from "@/components/audio/audio-player-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

/**
 * Khung ứng dụng nằm ở LAYOUT, không phải trong từng trang.
 *
 * Trước đây mỗi trang tự gọi `requireSession()` + `getSubscriptionSnapshot()`
 * rồi tự bọc `<DashboardShell>`. Vì khung là một phần của trang, mỗi lần chuyển
 * tab nó bị dựng lại từ đầu, kéo theo bốn vòng gọi mạng nối tiếp (auth, hồ sơ,
 * gói, đơn hộp) cho dữ liệu giống hệt lần trước.
 *
 * Đặt ở layout thì Next giữ nguyên khung khi điều hướng giữa các trang cùng cấp
 * — payload của layout nằm trong Router Cache và không phải lấy lại. Chuyển tab
 * chỉ còn phải lấy phần nội dung.
 *
 * Kèm theo đó, `loading.tsx` mới có tác dụng: nó thay đúng vùng nội dung trong
 * khi thanh điều hướng và header đứng yên. Không có bước này thì skeleton sẽ
 * nuốt luôn cả thanh tab, nháy còn khó chịu hơn đứng hình.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    // Provider bọc ngoài khung để tiếng vẫn phát khi chuyển trang.
    <AudioPlayerProvider>
      <DashboardShell
        sessionName={session.name}
        sessionEmail={session.email}
        subscription={subscription}
        isAdmin={session.role === "admin"}
      >
        {children}
      </DashboardShell>
    </AudioPlayerProvider>
  );
}
