import type { Metadata } from "next";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LumiaThemeProvider } from "@/components/theme/lumia-theme-provider";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { ToastProvider } from "@/components/ui/toast";
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
  metadataBase: new URL("https://lumia.vn"),
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
          <GoogleAnalytics />
          <ToastProvider>
            {children}
          </ToastProvider>
        </LumiaThemeProvider>
      </body>
    </html>
  );
}
