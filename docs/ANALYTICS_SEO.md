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

Có hai đường, và **cách xác minh quyết định định danh property** — chọn nhầm là
API trả 403:

| Cách xác minh | Loại property | `GSC_SITE_URL` |
|---|---|---|
| DNS (**TXT** hoặc **CNAME**) | Domain property | `sc-domain:lumia.com.vn` |
| HTML tag / HTML file | URL prefix | `https://www.lumia.com.vn/` |

**Khuyên dùng Domain property** (xác minh bằng DNS): nó gộp apex, `www`, http,
https và mọi subdomain vào một property, thay vì phải tạo bốn cái riêng.

DNS của dự án do Vercel quản lý (`ns1/ns2.vercel-dns.com`), nên bản ghi thêm ở
**Vercel → Domains → DNS Records**, không phải ở nhà đăng ký tên miền.

Nếu chọn **HTML tag**: copy giá trị trong `content="..."` rồi set

```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = <giá trị content>
```

và redeploy trước khi bấm Verify. Thẻ meta render từ `metadata.verification.google`
trong `src/app/layout.tsx`. Xác minh bằng DNS thì biến này không cần.

### Không phải đoán `GSC_SITE_URL`

Bỏ trống biến đó thì code gọi `GET /webmasters/v3/sites` hỏi Google xem service
account đang có quyền trên property nào, rồi tự chọn (`pickBestSite`):

1. Domain property của tên miền gốc — bao trọn www lẫn non-www
2. URL prefix trùng đúng host đang chạy
3. URL prefix cùng tên miền gốc (đã verify non-www nhưng app chạy ở www)

Property chỉ có quyền `siteUnverifiedUser` bị bỏ qua: liệt kê ra được nhưng gọi
`searchAnalytics` vẫn 403.

Khi vẫn 403, thông báo lỗi liệt kê thẳng những property service account đang có
quyền — đủ để thấy ngay là thiếu quyền hay gọi nhầm dạng property.

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

Báo cáo chia làm hai tab trong `/admin`, đều chọn được kỳ 7 / 28 / 90 ngày và
mọi KPI đều kèm so sánh với kỳ liền trước:

| Tab | Nội dung | Nguồn |
|---|---|---|
| **Báo cáo** | Doanh thu, đơn hàng, giá trị đơn TB, tài khoản mới + biểu đồ theo ngày | Supabase — **luôn là số thật** |
| **Vận hành** | Google Analytics, Search Console, Vercel | API Google (hoặc dữ liệu mẫu) |

> Tab **Vận hành** đang **tạm ẩn**. Bật lại bằng cách bỏ comment hai dòng
> `operations` trong `src/components/admin/admin-dashboard.tsx` (mục `TABS`
> và phần render), giống cách tab Blog đang được tắt.

Đường đi của dữ liệu:

```
AnalyticsReportPanel      → GET /api/admin/analytics?sections=business
                                └── src/lib/analytics/business.ts       → Supabase

OperationsReportPanel     → GET /api/admin/analytics?sections=traffic
                                ├── src/lib/analytics/ga4.ts            → GA4 Data API
                                └── src/lib/analytics/search-console.ts → Search Console API
```

Tham số `sections` để mỗi tab chỉ gọi đúng nguồn nó hiển thị — tab Báo cáo không
phải chờ hai vòng gọi API Google chỉ để hiện doanh thu đọc từ một query Supabase.
Bỏ trống `sections` thì trả tất cả.

Các nguồn gọi song song và trả trạng thái riêng — một bên hỏng thì bên còn lại
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
| `GSC_SITE_URL` | Property Search Console. **Nên bỏ trống** — code tự dò, xem mục 2 |

Các biến này **không** có tiền tố `NEXT_PUBLIC_` — private key chỉ được đọc ở
server, không bao giờ lọt vào bundle của trình duyệt.

### Lỗi hay gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| "Chưa cấu hình GA4_PROPERTY_ID…" | Thiếu env, hoặc điền nhầm `G-XXXXXXXXXX` vào `GA4_PROPERTY_ID` |
| "Không lấy được access token" | `private_key` mất newline — phải giữ `\n`, đừng xoá |
| Search Console trả 403 | Thông báo lỗi liệt kê property đang có quyền. Không có property nào = chưa add service account. Có nhưng khác chuỗi đang gọi = `GSC_SITE_URL` sai dạng (verify bằng DNS thì phải là `sc-domain:...`) — bỏ trống biến này để code tự dò |
| GA4 trả 403 | Chưa bật Google Analytics Data API, hoặc service account chưa có quyền Viewer trên property |

### Khối "Kinh doanh" — luôn là số thật

Doanh thu, số đơn, giá trị đơn trung bình và tài khoản mới đọc thẳng từ Supabase
(`src/lib/analytics/business.ts`): gộp `orders` (gói subscription/box) và
`store_orders` (sản phẩm lẻ), chỉ tính các trạng thái đã thu tiền
(`paid`, `preparing`, `shipping`, `delivered`).

Khối này **không có bản demo** và không bao giờ bị thay bằng số mẫu.

### Dữ liệu mẫu khi chưa nối được API

Site mới mở thường chưa kịp cấu hình GA4/Search Console, mà tab trống thì không
đánh giá được giao diện. Vì vậy dữ liệu mẫu **bật sẵn**: khối nào có trạng thái
`not_configured` sẽ được lấp bằng số mẫu. Tắt hẳn bằng:

```
ANALYTICS_DEMO_MODE=false
```

**Cần nhớ khi bật:**

- Chỉ lấp chỗ nguồn có trạng thái `not_configured`. Đã nối được API thật thì
  **dữ liệu thật luôn thắng**, kể cả khi API trả về 0. Nguồn đang lỗi cũng giữ
  nguyên thông báo lỗi để còn biết mà sửa.
- Khối **Kinh doanh** luôn là số thật từ database, không bao giờ bị thay.
- Nhãn "Dữ liệu mẫu" trên UI **mặc định ẩn** cho gọn màn hình. Cờ `demo` của
  từng nguồn vẫn nằm trong response của `/api/admin/analytics`, nên lúc nào
  cũng tra được nguồn nào đang chạy số mẫu — bật `ANALYTICS_DEMO_SHOW_LABEL=true`
  để hiện nhãn lại trên giao diện.
- Đây là số do app tự sinh, không phải số đo được. Đừng dùng để báo cáo ra
  ngoài hay ra quyết định kinh doanh.

Các biến tinh chỉnh:

| Variable | Ghi chú |
|---|---|
| `ANALYTICS_DEMO_LAUNCH_DATE` | Mốc mở bán. Bỏ trống = profile sớm nhất trong DB, không có thì lùi 60 ngày |
| `ANALYTICS_DEMO_PEAK_DAILY_USERS` | Trần người dùng/ngày, mặc định `110` |
| `ANALYTICS_DEMO_SHOW_LABEL` | `true` = hiện nhãn "Dữ liệu mẫu" trên UI. Mặc định ẩn |

#### Mô hình đằng sau số liệu mẫu

`src/lib/analytics/demo-data.ts` dựng theo vòng đời một site mới:

- **Lưu lượng** — spike tuần đầu (bạn bè, mạng xã hội) tắt dần, cộng đường bão hoà
  tiến tới `ANALYTICS_DEMO_PEAK_DAILY_USERS`. Cuối tuần nhỉnh hơn ngày thường.
- **Chất lượng phiên** — tỉ lệ tương tác và thời lượng phiên tăng dần theo tuổi
  site; tỉ lệ người dùng mới giảm dần khi tệp quay lại lớn lên.
- **Search Console** — **0 impression trong 14 ngày đầu** vì Google chưa index
  xong site mới, sau đó impression bò lên, CTR nhích từ ~1,4% lên ~3,2%, vị trí
  trung bình từ ~38 về ~18.
- **Kênh vào** — Direct dẫn đầu (38%): marketing chưa chạy hiệu quả nên phần lớn
  khách là người đã biết thương hiệu hoặc được giới thiệu tay đôi. Organic Search
  thấp vì domain chưa có tuổi. Thiết bị nghiêng hẳn về mobile (74%), thị trường
  chủ yếu là Việt Nam (94,5%).
- **Trang xem nhiều nhất** — có cả trang marketing lẫn khu vực đã đăng nhập, và
  hai nhóm này phân biệt nhau bằng tỉ lệ **lượt xem/người**: trang marketing xem
  một lần rồi thôi (~1,3-2,3), còn `/dashboard`, `/journal`, `/ai`, `/audio`
  được người dùng thật quay lại hằng ngày nên cao hơn nhiều (~3,6-6,5).
  Search Console chỉ liệt kê trang công khai, vì khu vực đăng nhập đã bị chặn
  trong `robots.txt`.
- **Trang bị ẩn** — `HIDDEN_PATH_PREFIXES` loại hẳn `/blog` khỏi cả GA4 lẫn
  Search Console: blog đang bị gỡ khỏi `marketingNavLinks`, `footerColumns` và
  tab admin, không có đường nào dẫn tới thì không thể có lưu lượng. Bật blog
  trở lại thì xoá prefix đó. Vì không có trang nội dung để hứng truy vấn kiểu
  "cách/mẹo", cơ cấu từ khoá cũng nghiêng về truy vấn thương hiệu và sản phẩm.

Với mặc định `30`, mỗi ngày dao động **23-33 người dùng**:

| Kỳ | Người dùng | Mới | Phiên | Lượt xem | Click |
|---|---|---|---|---|---|
| 7 ngày | 189 | 123 | 240 | 707 | 36 |
| 28 ngày | 703 | 488 | 895 | 2.639 | 137 |
| 90 ngày | 1.196 | 884 | 1.520 | 4.487 | 159 |

Tăng `ANALYTICS_DEMO_PEAK_DAILY_USERS` thì mọi chỉ số co giãn cùng nhau — kể cả
impression của Search Console — nên tỉ lệ giữa các con số vẫn hợp lý.

Tổng của 28 ngày luôn xấp xỉ 4 lần tổng của 7 ngày; đó là số học chứ không phải
lỗi cấu hình. Muốn so sánh ba kỳ trên cùng thang đo thì nhìn biểu đồ, không nhìn
ô tổng.

#### Số điểm trên biểu đồ

| Kỳ | Số điểm | Mỗi điểm là |
|---|---|---|
| 7 ngày | 7 | một ngày |
| 28 ngày | 28 | một ngày |
| 90 ngày | 13 | trung bình mỗi ngày trong một tuần |

Kỳ 90 ngày vẽ từng ngày sẽ ra 90 cột chen chúc, không đọc được nhãn nào. Gom
theo tuần và lấy **trung bình mỗi ngày** — không phải tổng: dùng tổng thì trục Y
cao gấp 7 lần các kỳ ngắn, đổi tab một cái là tưởng lưu lượng tăng vọt trong khi
thực tế không đổi. Nhãn series kèm hậu tố `(TB/ngày)` để không ai đọc nhầm.

#### Sàn theo số tài khoản thật

`calibrateForSignups` tự nâng quy mô dữ liệu mẫu cho đủ phủ số tài khoản **thật**
đã đăng ký trong kỳ, trần chuyển đổi 25%.

Không có bước này, hai khối trên cùng một màn hình sẽ mâu thuẫn: khối Kinh doanh
đọc từ DB có thể hiện 500 tài khoản mới trong khi khối Truy cập chỉ có 1.057
khách ghé — hoặc tệ hơn, nhiều người đăng ký hơn người vào site, điều bất khả.
Hệ thống đang có ~1.700 tài khoản, phần lớn là tài khoản seed không đến từ web,
nên tình huống này rất dễ xảy ra nếu chúng rơi vào kỳ báo cáo.

Đây là **sàn**, không phải mục tiêu: dưới ~264 tài khoản/kỳ thì quy mô giữ
nguyên như đã cấu hình.

Hai tính chất được test khoá lại (`demo-data.test.ts`):

1. **Tất định** — cùng một ngày luôn ra cùng con số. Số nhảy sau mỗi lần bấm
   "Làm mới" là dấu hiệu rõ nhất của dữ liệu bịa.
2. **Tính theo ngày tuyệt đối** — 7 ngày cuối của biểu đồ 90 ngày trùng khớp
   từng ngày với biểu đồ 7 ngày, nên đổi kỳ không bao giờ ra hai câu chuyện
   mâu thuẫn.

### Chuyển từ dữ liệu mẫu sang số thật

GA4 **không có dữ liệu hồi tố** — chỉ đếm từ lúc tag chạy. Search Console thì
ngược lại: verify property là có ngay tới 16 tháng lịch sử, vì Google vẫn ghi
nhận impression/click từ trước. Nên chỉ **một nửa** cần xử lý.

Quy trình:

1. Nối GA4 + GSC theo mục trên, redeploy, kiểm bằng GA4 Realtime
2. Đặt `ANALYTICS_REAL_DATA_SINCE` = **ngày đầu tiên trọn vẹn** sau khi tag chạy
   (không phải ngày cài — ngày cài thiếu vài giờ đầu, sẽ thành hố sụt)
3. Đặt `ANALYTICS_DEMO_MODE=false`
4. Chờ **3 ngày**, rồi vào `/admin` → tab Báo cáo → khối *Lịch sử trước ngày gắn
   đo* → bấm **Nối lịch sử**

Bước 4 làm ba việc: đọc traffic thật của 3 ngày đầu, tính hệ số co giãn bằng
cách so với mức mà bộ sinh tạo ra cho **đúng những ngày đó**, rồi dựng lại toàn
bộ giai đoạn trước mốc theo hệ số đó và ghi vào `analytics_daily_snapshot`.

Kết quả: biểu đồ liền mạch, không có vách đứng ở chỗ nối, vì đoạn dựng lại đã
được kéo về đúng mức traffic thật.

Bấm lại nút bất cứ lúc nào để neo lại theo dữ liệu mới hơn — nó xoá và ghi đè
toàn bộ đoạn `source = 'demo'`, không đụng tới dòng nào là số đo được.

#### Vì sao phải đóng băng vào DB

Bộ sinh neo theo profile sớm nhất trong DB, nên chỉ cần xoá một user cũ là cả
lịch sử dịch chuyển. Chấp nhận được khi nó là placeholder tạm, không chấp nhận
được khi đã thành lịch sử chính thức của báo cáo.

Bảng lưu cột `source` (`demo` / `ga4`) cho từng ngày, và `scale_factor` đã dùng.
Sáu tháng nữa vẫn tra được ngày nào là số đo được, và xoá đoạn dựng lại chỉ là
một câu `DELETE ... WHERE source = 'demo'`.

#### Ràng buộc khi nối

- **Một ngày chỉ thuộc một nguồn.** Ngày nào GA4 có số thì số thật thắng tuyệt
  đối, không bao giờ cộng hai nguồn cho cùng một ngày.
- **Tỉ lệ tương tác và thời lượng phiên lấy trọng số theo số phiên**, không phải
  trung bình cộng — đoạn lịch sử dài gấp nhiều lần đoạn thật, trung bình cộng sẽ
  để vài ngày thật đè bẹp hai tháng.
- **Hệ số neo bị chặn trong [0,05 … 20].** Với 3 ngày mẫu, một ngày bất thường
  (bài viral, bot, hay chính bạn F5 50 lần) đủ để nhân hoặc chia cả hai tháng.
- **Cơ cấu nguồn/thiết bị/quốc gia và top trang giữ nguyên bản thật.** Cơ cấu đo
  được đáng tin hơn cơ cấu dựng lại, và trộn hai bộ tỉ trọng chỉ tạo ra một phân
  bố không thuộc về ai.

Đoạn dựng lại tự rơi khỏi cả ba kỳ báo cáo sau 90 ngày — giải pháp này có tuổi
thọ hữu hạn, không phải tính năng sống mãi.

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
