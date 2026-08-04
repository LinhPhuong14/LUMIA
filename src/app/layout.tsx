import type { Metadata } from "next";

import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { LumiaThemeProvider } from "@/components/theme/lumia-theme-provider";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { CartProvider } from "@/lib/cart-context";
import { env } from "@/lib/env";
import { isIndexableDeployment } from "@/lib/seo";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
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
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
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
