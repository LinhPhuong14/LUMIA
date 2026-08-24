import type { Route } from "next";

export type SiteNavLink = {
  id: string;
  label: string;
  href: Route | `#${string}`;
  external?: boolean;
};

export const marketingNavLinks: SiteNavLink[] = [
  { id: "about", label: "Về chúng tôi", href: "/about" },
  { id: "store", label: "Cửa hàng", href: "/store" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "quiz", label: "Tìm gói phù hợp", href: "/quiz" },
];

export const landingAnchorLinks: SiteNavLink[] = [
  { id: "ritual", label: "Nghi thức", href: "#nghi-thuc" },
  { id: "packages", label: "Gói LUMIA", href: "#goi-lumia" },
  { id: "listen", label: "Lắng nghe", href: "#lang-nghe" },
  { id: "app", label: "Web app", href: "#web-app" },
  { id: "stories", label: "Câu chuyện", href: "#cau-chuyen" },
];

/**
 * Thanh điều hướng nổi của landing page: các anchor trong trang, cộng một link
 * thật tới `/blog`.
 *
 * Blog là loại trang duy nhất của site hứng được truy vấn thông tin ("cách ngủ
 * ngon", "mẹo thư giãn trước khi ngủ") — những trang bán hàng không xếp hạng
 * cho các truy vấn đó. Muốn Google chấm blog là nội dung chính chứ không phải
 * phần phụ, nó cần một link từ trang chủ, tức trang nhận nhiều liên kết ngoài
 * nhất và truyền lại nhiều thẩm quyền nhất. Footer cũng có link, nhưng link
 * nằm trong điều hướng đầu trang được đánh trọng số cao hơn hẳn link footer.
 */
export const landingNavLinks: SiteNavLink[] = [
  ...landingAnchorLinks,
  { id: "blog", label: "Blog", href: "/blog" },
];

export type FooterLink =
  | { label: string; href: Route; external?: false }
  | { label: string; href: string; external: true };

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Khám phá Lumia",
    links: [
      { label: "Trang chủ", href: "/" as Route },
      { label: "Về chúng tôi", href: "/about" as Route },
      { label: "Tính năng", href: "/#web-app" as Route },
      { label: "Cửa hàng", href: "/store" as Route },
      { label: "Blog", href: "/blog" as Route },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Cài đặt", href: "/settings" as Route },
      { label: "Đăng nhập", href: "/login" as Route },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Chính sách bảo mật", href: "/privacy" as Route },
      { label: "Điều khoản sử dụng", href: "/terms" as Route },
    ],
  },
];

export const defaultRegisterNext = "/onboarding";
export const defaultLoginNext = "/dashboard";
