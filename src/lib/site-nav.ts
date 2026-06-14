import type { Route } from "next";

export type SiteNavLink = {
  id: string;
  label: string;
  href: Route | `#${string}`;
  external?: boolean;
};

export const marketingNavLinks: SiteNavLink[] = [
  { id: "packages", label: "Gói LUMIA", href: "/boxes" },
  { id: "quiz", label: "Tìm gói phù hợp", href: "/quiz" },
];

export const landingAnchorLinks: SiteNavLink[] = [
  { id: "ritual", label: "Nghi thức", href: "#nghi-thuc" },
  { id: "packages", label: "Gói LUMIA", href: "#goi-lumia" },
  { id: "listen", label: "Lắng nghe", href: "#lang-nghe" },
  { id: "app", label: "Web app", href: "#web-app" },
  { id: "stories", label: "Câu chuyện", href: "#cau-chuyen" },
];

export const footerColumns = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Gói thành viên", href: "/boxes" as Route },
      { label: "Tìm gói phù hợp", href: "/quiz" as Route },
      { label: "Sleep Box", href: "/boxes/sleep-well" as Route },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Không gian của bạn", href: "/dashboard" as Route },
      { label: "Lắng nghe", href: "/ai" as Route },
      { label: "Nhật ký", href: "/journal" as Route },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Đăng nhập", href: "/login" as Route },
      { label: "Tạo tài khoản", href: "/register?next=/onboarding" as Route },
      { label: "Cài đặt", href: "/settings" as Route },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Điều khoản", href: "/boxes" as Route },
      { label: "Quyền riêng tư", href: "/boxes" as Route },
    ],
  },
] as const;

export const defaultRegisterNext = "/onboarding";
export const defaultLoginNext = "/dashboard";
