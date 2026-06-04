import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LUMIA | Nghi thức dịu lành cho buổi tối",
    template: "%s | LUMIA",
  },
  description:
    "LUMIA là không gian dịu lành cho những buổi tối cần được ôm lại bằng chăm sóc, cảm xúc và những nhịp nghỉ ngơi mềm hơn.",
  metadataBase: new URL("https://lumia.vn"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full font-sans text-foreground">{children}</body>
    </html>
  );
}
