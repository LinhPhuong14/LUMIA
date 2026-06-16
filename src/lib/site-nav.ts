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
  { id: "quiz", label: "Tìm gói phù hợp", href: "/quiz" },
];

export const landingAnchorLinks: SiteNavLink[] = [
  { id: "ritual", label: "Nghi thức", href: "#nghi-thuc" },
  { id: "packages", label: "Gói LUMIA", href: "#goi-lumia" },
  { id: "listen", label: "Lắng nghe", href: "#lang-nghe" },
  { id: "app", label: "Web app", href: "#web-app" },
  { id: "stories", label: "Câu chuyện", href: "#cau-chuyen" },
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
