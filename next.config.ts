import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // Ảnh sản phẩm và ảnh bìa audio do admin tải lên nằm ở Supabase Storage
      // (`https://<project>.supabase.co/storage/v1/object/public/...`). Thiếu
      // host này thì không dùng `next/image` cho chúng được, và ảnh gốc chụp
      // bằng điện thoại sẽ được phục vụ nguyên cỡ vài MB xuống máy khách.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Ảnh sản phẩm hiếm khi đổi; cache bản đã resize lâu hơn mặc định 60s để
    // lượt xem sau không phải chuyển đổi lại.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
