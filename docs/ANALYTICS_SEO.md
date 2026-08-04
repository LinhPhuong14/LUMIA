# Analytics & SEO

Ba hệ thống đo lường đã được tích hợp sẵn: **Google Analytics 4**, **Google Search Console**
và **Vercel Analytics (Web Analytics + Speed Insights)**.

Tất cả gắn vào app qua một điểm duy nhất: `<SiteAnalytics />` trong `src/app/layout.tsx`.

---

## 1. Google Analytics 4

### Setup

1. Vào [analytics.google.com](https://analytics.google.com) → **Admin** → **Data Streams** → **Web**
2. Tạo stream cho domain, copy **Measurement ID** (dạng `G-XXXXXXXXXX`)
3. Vercel → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
   ```

4. Redeploy (biến `NEXT_PUBLIC_*` được inline lúc build, đổi env phải build lại)

Bỏ trống biến này = không nhúng gtag. ID sai định dạng cũng bị bỏ qua
(`isValidGaId` chặn, tránh nhúng nhầm ID kiểu Universal Analytics `UA-...`).

### Page view

App Router điều hướng client-side nên gtag **không** tự nhận ra route đổi. Vì vậy:

- `gtag('config', ..., { send_page_view: false })` — tắt page view tự động
- `<GaPageViewTracker />` lắng nghe `usePathname()` + `useSearchParams()` rồi bắn
  `page_view` thủ công mỗi lần route đổi

Không làm vậy thì GA chỉ ghi nhận đúng trang đầu tiên của mỗi session.

### Custom event

```ts
import { trackEvent } from "@/lib/analytics";

trackEvent("audio_session_started", { track: "sleep-rain", duration: 600 });
```

Các helper theo chuẩn ecommerce GA4 có sẵn:

| Helper | Event GA4 | Đang gọi ở |
|---|---|---|
| `trackBeginCheckout()` | `begin_checkout` | `checkout-panel.tsx` — khi tạo payment link thành công |
| `trackPurchase()` | `purchase` | `checkout-panel.tsx` — khi PayOS báo thanh toán xong |

Mọi hàm đều no-op và trả `false` nếu gtag chưa load / GA tắt — gọi ở đâu cũng an toàn.

---

## 2. Google Search Console

### Xác minh domain

1. [search.google.com/search-console](https://search.google.com/search-console) → **Add property**
   → chọn **URL prefix** → nhập `https://www.lumia.com.vn`
2. Chọn cách verify **HTML tag**, copy giá trị trong `content="..."`
3. Vercel → Environment Variables:

   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = <giá trị content>
   ```

4. Redeploy → bấm **Verify**

Thẻ meta được render từ `metadata.verification.google` trong `src/app/layout.tsx`.

### Sitemap

`/sitemap.xml` sinh tự động (`src/app/sitemap.ts`), revalidate mỗi giờ, gồm:

- Route tĩnh công khai — khai báo trong `STATIC_SITEMAP_ROUTES` (`src/lib/seo.ts`)
- Các gói `/boxes/[slug]` — lấy từ catalog tĩnh
- Sản phẩm `/store/[slug]` — query Supabase
- Bài blog `/blog/[slug]` — query Supabase, fallback về `src/data/blog-posts.ts`

Sau khi verify xong, submit `https://www.lumia.com.vn/sitemap.xml` ở tab **Sitemaps**.

Thêm trang công khai mới → nhớ thêm vào `STATIC_SITEMAP_ROUTES`.

### robots.txt

`/robots.txt` sinh từ `src/app/robots.ts`:

- **Production** (`VERCEL_ENV=production`): cho crawl, chặn các prefix riêng tư trong
  `DISALLOWED_CRAWL_PATHS` (`/api`, `/admin`, `/dashboard`, `/account`, `/checkout`, ...)
  và khai báo sitemap
- **Preview / local**: `Disallow: /` toàn bộ, kèm `<meta name="robots" content="noindex, nofollow">`
  — để preview deploy không cạnh tranh nội dung với domain chính

`metadataBase` bám theo `NEXT_PUBLIC_APP_URL` nên canonical trên preview không trỏ nhầm
về production.

---

## 3. Vercel Analytics

Không cần biến env. Bật ở **Vercel Dashboard → Project**:

- Tab **Analytics** → Enable (Web Analytics — pageview, referrer, device)
- Tab **Speed Insights** → Enable (Core Web Vitals thật từ người dùng)

`<Analytics />` và `<SpeedInsights />` tự no-op khi chạy ngoài Vercel, nên local dev
không gửi dữ liệu rác.

---

## Tắt toàn bộ analytics

```
NEXT_PUBLIC_ANALYTICS_DISABLED = true
```

Chặn cả GA lẫn Vercel Analytics. Hữu ích cho môi trường staging nội bộ.
