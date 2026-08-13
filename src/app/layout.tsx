import type { Metadata } from "next";
import { Manrope, Noto_Serif_Display } from "next/font/google";

import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { LumiaThemeProvider } from "@/components/theme/lumia-theme-provider";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { CartProvider } from "@/lib/cart-context";
import { env } from "@/lib/env";
import { isIndexableDeployment } from "@/lib/seo";
import "./globals.css";

/**
 * Font tự phục vụ từ chính domain của app, thay cho `@import` tới Google Fonts.
 *
 * Bản cũ đặt `@import url("https://fonts.googleapis.com/...")` trong CSS. Đó là
 * đường nạp chậm nhất có thể: trình duyệt phải tải CSS của app, phân tích tới
 * dòng `@import`, MỚI mở kết nối tới fonts.googleapis.com, rồi file trả về lại
 * trỏ tiếp sang fonts.gstatic.com — ba vòng nối tiếp qua hai domain lạ, mỗi vòng
 * kèm một lần bắt tay TLS, tất cả đều chặn việc hiện chữ. Trên 4G đó là gần một
 * giây nhìn màn hình trắng.
 *
 * `next/font/google` tải font lúc build, phục vụ cùng domain, và nhúng thẳng
 * `@font-face` vào CSS — không còn vòng gọi nào ra ngoài.
 */
const fontDisplay = Noto_Serif_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display-loaded",
});

const fontBody = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body-loaded",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
  /**
   * Bàn phím ảo làm CO LẠI layout viewport, không chỉ visual viewport.
   *
   * Mặc định của Android Chrome là `resizes-visual`: bàn phím mở ra nhưng
   * layout viewport giữ nguyên chiều cao, nên `position: fixed; bottom: 0` vẫn
   * neo vào đáy trang — tức là nằm KHUẤT SAU bàn phím. Đó là lý do ô nhập chat
   * phải tự tính bù bằng JS, và vì phép bù đó chạy sau khi trình duyệt đã tự
   * cuộn để lộ ô nhập nên hai bên đá nhau, kết quả là thanh nhập nhảy ra giữa
   * màn hình.
   *
   * Với `resizes-content`, chiều cao layout co lại đúng bằng phần bàn phím
   * chiếm chỗ, nên bố cục flex và `dvh` tự đúng — không cần một dòng JS nào.
   */
  interactiveWidget: "resizes-content" as const,
  themeColor: "#5f7a45",
};

export const metadata: Metadata = {
  title: {
    default: "LUMIA | Hệ sinh thái tái tạo giấc ngủ",
    template: "%s | LUMIA",
  },
  description:
    "LUMIA là hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ - theo dõi cảm xúc, phân tích dữ liệu và AI lắng nghe.",
  // Bám theo APP_URL để canonical trên preview không trỏ nhầm về domain production.
  metadataBase: new URL(env.APP_URL),
  alternates: {
    canonical: "/",
  },
  // Thẻ xác minh quyền sở hữu domain cho Google Search Console.
  verification: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: isIndexableDeployment()
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden font-sans text-foreground">
        <ThemeInitScript />
        <LumiaThemeProvider>
          <CartProvider>
            <SiteAnalytics />
            {children}
          </CartProvider>
        </LumiaThemeProvider>
      </body>
    </html>
  );
}
