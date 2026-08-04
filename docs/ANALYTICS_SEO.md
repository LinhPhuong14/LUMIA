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

## 4. Báo cáo trong trang admin

`/admin` → tab **Báo cáo** gộp số liệu GA4 và Search Console vào một màn hình:
KPI kèm so sánh với kỳ liền trước, biểu đồ theo ngày, top trang, nguồn traffic,
thiết bị, quốc gia, top từ khoá. Chọn kỳ 7 / 28 / 90 ngày.

Đường đi của dữ liệu:

```
AnalyticsReportPanel  →  GET /api/admin/analytics?range=28d
                              ├── src/lib/analytics/ga4.ts             → GA4 Data API
                              └── src/lib/analytics/search-console.ts  → Search Console API
```

Hai nguồn gọi song song và trả trạng thái riêng — một bên hỏng thì bên còn lại
vẫn hiện, phần lỗi hiển thị đúng nguyên nhân thay vì màn hình trắng.

### Setup service account

Đọc số liệu cần server-to-server auth, nên dùng service account của Google Cloud
(không phải OAuth theo user):

1. [console.cloud.google.com](https://console.cloud.google.com) → **IAM & Admin**
   → **Service Accounts** → **Create service account**
2. **Keys** → **Add key** → **JSON** → tải file về
3. **APIs & Services** → **Library** → bật **Google Analytics Data API**
4. GA4 → **Admin** → **Property access management** → thêm `client_email` của
   service account với quyền **Viewer**
5. Search Console → **Settings** → **Users and permissions** → thêm chính email
   đó (quyền **Full** hoặc **Restricted**)

Rồi set env trên Vercel:

| Variable | Ghi chú |
|---|---|
| `GA4_PROPERTY_ID` | Chỉ số, lấy ở GA4 → Admin → Property Settings. **Không phải** `G-XXXXXXXXXX` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` trong file JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `private_key` trong file JSON, giữ nguyên `\n`, bọc trong nháy kép |
| `GSC_SITE_URL` | Property của Search Console. Bỏ trống = lấy theo `NEXT_PUBLIC_APP_URL` |

Các biến này **không** có tiền tố `NEXT_PUBLIC_` — private key chỉ được đọc ở
server, không bao giờ lọt vào bundle của trình duyệt.

### Lỗi hay gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| "Chưa cấu hình GA4_PROPERTY_ID…" | Thiếu env, hoặc điền nhầm `G-XXXXXXXXXX` vào `GA4_PROPERTY_ID` |
| "Không lấy được access token" | `private_key` mất newline — phải giữ `\n`, đừng xoá |
| Search Console trả 403 | Service account chưa được thêm vào property, hoặc `GSC_SITE_URL` không khớp chính xác (thiếu `/` cuối, thiếu `www`, hay property là dạng `sc-domain:`) |
| GA4 trả 403 | Chưa bật Google Analytics Data API, hoặc service account chưa có quyền Viewer trên property |

### Vì sao kỳ báo cáo dừng ở hôm qua

GA4 chốt số theo ngày và Search Console trễ 2-3 ngày. Nếu tính tới hôm nay,
cột cuối luôn tụt gần 0 và phần trăm so sánh sẽ sai lệch — nên `resolveDateRange`
kết thúc ở hôm qua, kỳ trước dài đúng bằng kỳ hiện tại và nối liền phía trước.

---

## Tắt toàn bộ analytics

```
NEXT_PUBLIC_ANALYTICS_DISABLED = true
```

Chặn cả GA lẫn Vercel Analytics. Hữu ích cho môi trường staging nội bộ.
