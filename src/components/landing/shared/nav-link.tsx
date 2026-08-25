import type { Route } from "next";
import Link from "next/link";

import type { SiteNavLink } from "@/lib/site-nav";

/**
 * Anchor trong trang (`#section`) không có route thật để điều hướng hay
 * prefetch — vẫn dùng `<a>` thường. Còn lại (`/blog`, `/store`, `/quiz`…) là
 * route thật: dùng `next/link` để có prefetch (Next tải sẵn HTML/RSC payload
 * khi link vào viewport) và chuyển trang phía client, thay vì mỗi click là
 * một lần nạp lại toàn bộ trang từ đầu.
 *
 * Cả `FloatingNavbar` lẫn `LandingMobileDrawer` từng render toàn bộ danh sách
 * (anchor lẫn route thật) bằng `<a>` — nhiều khả năng để né kiểu `Route |
 * \`#${string}\`` không khớp thẳng với `LinkProps.href` khi bật `typedRoutes`.
 * Hậu quả thực tế: click "Blog" trong lúc landing page còn đang tải sẽ hủy
 * ngang request đang chạy dở và bắt đầu một lần tải trang mới từ đầu — đúng
 * cảm giác "2 luồng cùng chạy" mà không có gì báo cho người dùng biết.
 */
export function NavLink({
  link,
  className,
  onClick,
}: {
  link: SiteNavLink;
  className?: string;
  onClick?: () => void;
}) {
  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} className={className} onClick={onClick}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href as Route} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}
