import { getDashboardGreeting } from "@/lib/time-greeting";

/**
 * Tiêu đề + phụ đề của từng trang trong (app), tra theo đường dẫn.
 *
 * Trước đây mỗi trang tự truyền `title`/`subtitle` xuống `DashboardShell`, mà
 * shell lại được render BÊN TRONG từng trang. Hệ quả là mỗi lần chuyển tab,
 * toàn bộ khung (header, sidebar, thanh tab) bị dựng lại cùng trang mới, và
 * session + gói thành viên phải đọc lại từ đầu.
 *
 * Chuyển khung lên `(app)/layout.tsx` thì layout không còn nhận được prop từ
 * trang nữa — nên hai chuỗi này tra theo pathname. Đổi lại: khung đứng yên khi
 * chuyển tab, và `loading.tsx` chỉ thay phần nội dung.
 */
export type PageMeta = { title: string; subtitle: string };

/** Khớp CHÍNH XÁC trước, vì /audio và /audio/sleep là hai trang khác nhau. */
const EXACT: Record<string, PageMeta> = {
  // Một tiêu đề cho cả ba tab (Tài khoản / Cài đặt / Góp ý). Trước đây tiêu đề
  // đổi theo `?tab=`, nhưng đọc query param trong khung đòi `useSearchParams`,
  // kéo theo Suspense và nguy cơ cả route rơi về render phía client. Ba tab đã
  // có dải nút ngay dưới header nên vẫn thấy rõ đang ở đâu.
  "/account": {
    title: "Tài khoản",
    subtitle: "Hộp của bạn, đơn hàng, cài đặt và góp ý.",
  },
  "/ai": {
    title: "LUMIA lắng nghe bạn.",
    subtitle:
      "Một không gian riêng tư để bạn được nói ra điều đang ở trong lòng, theo nhịp nhẹ và không bị phán xét.",
  },
  "/audio": {
    title: "Âm thanh cho buổi tối",
    subtitle: "Giấc ngủ, thiền định, thở và timer - chọn nhịp phù hợp với bạn.",
  },
  "/audio/sleep": {
    title: "Giấc ngủ",
    subtitle: "Âm thanh dịu nhẹ để bạn dễ vào giấc hơn.",
  },
  "/audio/meditation": {
    title: "Thiền định",
    subtitle: "Thư viện nhạc thiền và hướng dẫn.",
  },
  "/audio/breathing": {
    title: "Thở cùng LUMIA",
    subtitle: "3 kỹ thuật thở - chọn một và để nhịp thở dẫn bạn về tĩnh lặng.",
  },
  "/audio/timer": {
    title: "Hẹn giờ thiền",
    subtitle: "Chọn thời gian và ambient sound - rồi để mình ở yên.",
  },
  "/journal": {
    title: "Cứ viết ra thôi.",
    subtitle:
      "Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy lòng mình nhẹ xuống một chút.",
  },
  "/journey": {
    title: "Hành trình của bạn",
    subtitle: "Nhìn lại lịch sử, mood và báo cáo - không phải để đánh giá, mà để hiểu mình hơn.",
  },
  "/mood-test": {
    title: "Kiểm tra cảm xúc",
    subtitle: "Vài câu hỏi ngắn để LUMIA gợi ý nội dung phù hợp với bạn.",
  },
  "/dashboard/store": {
    title: "Cửa hàng",
    subtitle: "Gói thành viên & sản phẩm wellbeing",
  },
};

export function resolvePageMeta(
  pathname: string,
  /** Dùng cho lời chào ở trang chủ — thay đổi theo buổi trong ngày. */
  userName: string,
): PageMeta {
  if (pathname === "/dashboard") {
    return {
      title: getDashboardGreeting(userName),
      subtitle: "Hôm nay bạn muốn bắt đầu từ đâu?",
    };
  }

  const exact = EXACT[pathname];
  if (exact) {
    return exact;
  }

  // Trang con chưa khai báo (vd /audio/xyz) thì mượn tiêu đề của trang cha thay
  // vì để trống — thà hơi chung chung còn hơn một khoảng trắng giữa header.
  const parent = Object.keys(EXACT)
    .filter((p) => pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0];

  return parent ? EXACT[parent] : { title: "LUMIA", subtitle: "" };
}
