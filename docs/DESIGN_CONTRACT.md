# LUMIA Web — Design Contract

> Tài liệu tóm tắt hợp đồng thiết kế UI/UX hiện tại của nền tảng LUMIA.  
> Phiên bản: 2026-06-11 · Phạm vi: `lumia-web` (Next.js frontend)

---

## 1. Mục đích & phạm vi

Tài liệu này mô tả:

- **Design contract** — quy ước visual, layout shell, và pattern tái sử dụng
- **Layout từng màn hình** — cấu trúc vùng nội dung và navigation
- **Điểm mạnh UI** — những gì đang hoạt động tốt và nhất quán
- **Điểm yếu UI** — khoảng trống, drift, và rủi ro cần xử lý

**Ngoài phạm vi:** `lumia_service_ai` (backend AI), thiết kế app mobile native, nội dung marketing copy chi tiết.

---

## 2. Brand & design tokens

### 2.1 Định vị visual

LUMIA hướng tới **wellness / sleep care** — ấm, dịu, không áp lực. Ngôn ngữ hình ảnh:

- Nền kem–matcha–champagne (ánh sáng buổi tối nhẹ)
- Glassmorphism mờ (`backdrop-blur`, viền `white/70`)
- Bo góc lớn (`20px`–`36px`), CTA dạng viên thuốc (`rounded-full`)
- Headline serif sang trọng, body sans gọn

### 2.2 Token hệ thống

Nguồn: `src/app/globals.css`, `src/styles/fonts.css`, `src/styles/theme.css`

| Token | Giá trị | Vai trò |
|-------|---------|---------|
| `--foreground` | `#2f2b25` | Chữ chính |
| `--muted` | `#746d63` | Chữ phụ |
| `--matcha-soft` / `--matcha` / `--matcha-deep` | `#eef2e5` / `#d7dfc3` / `#8d9d76` | Màu thương hiệu xanh trà |
| `--champagne` / `--honey` / `--clay` | `#fff1ba` / `#f4d878` / `#f4ead2` | Accent ấm, upsell, highlight |
| `--background` | `#fffefc` | Nền trang |

**Typography**

| Vai trò | Font | Class |
|---------|------|-------|
| Display / headline | Cormorant Garamond | `font-serif` |
| Body / UI | Manrope | `font-sans` (mặc định) |
| Section label | Uppercase, tracking rộng | `.eyebrow` |

**Spacing & container**

| Class | Quy ước |
|-------|---------|
| `.shell` | `max-w-7xl`, padding ngang responsive |
| `.landing-frame` | `min(70vw, 1280px)` — chỉ landing |
| Dashboard | `max-w-[1640px]`, sidebar `262px` |

### 2.3 Primitives (component classes)

| Class | Dùng cho |
|-------|----------|
| `.soft-card` | Card nội dung chuẩn (dashboard, settings, admin hub) |
| `.hero-card` | Card auth, onboarding, checkout success |
| `.liquid-panel` / `.liquid-glass` | Panel landing, checkout illustration |
| `.dashboard-glass` | Sidebar, header dashboard |
| `.button-primary` | CTA chính — nền `matcha-deep`, pill |
| `.button-secondary` | CTA phụ — viền/honey nhạt |

**UI kit React:** tối thiểu — chỉ `Logo`, `UpsellOverlay` trong `src/components/ui/`. Phần lớn UI dựa trên CSS classes + feature components.

---

## 3. Layout shells (3 vỏ chính)

```
┌─────────────────────────────────────────────────────────────┐
│  SHELL A — Landing (/)                                      │
│  FloatingNavbar (fixed) → full-width sections → Footer      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SHELL B — Marketing                                        │
│  SiteHeader (sticky) → .shell main → SiteFooter (tuỳ trang)  │
│  Dùng: /boxes, /checkout, /admin hub                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SHELL C — Dashboard (app)                                  │
│  Sidebar (desktop) | Bottom nav (mobile, 5 mục)             │
│  + dashboard-glass header (title, plan, avatar, logout)     │
│  + scrollable content                                         │
│  Dùng: /dashboard, /journal, /audio/*, /ai, /journey, ...  │
└─────────────────────────────────────────────────────────────┘
```

| Shell | Header/Nav | Footer |
|-------|------------|--------|
| Landing | `FloatingNavbar` — anchor in-page | `FooterSection` |
| Marketing | `SiteHeader` — links `/boxes`, `/dashboard` | `SiteFooter` |
| Dashboard | `Sidebar` + glass page header | Không |
| Admin sub | Chỉ link `← Quản trị` | Không |

---

## 4. Layout theo màn hình

> **Chi tiết đầy đủ:** xem [PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md) — mô tả cây layout, responsive, premium gating và file tham chiếu cho từng route.

Phần dưới là **tóm tắt**; bảng route dashboard xem §4.4.

### 4.1 Landing — `/`

**File:** `src/app/page.tsx`

```
FloatingNavbar
├── Hero (full viewport, video nền, 2 CTA)
├── Ritual Steps (3 card ngang)
├── Boxes Showcase (grid 5 gói catalog)
├── AI Listening (2 cột copy + visual)
├── Testimonials (carousel/grid quote)
├── Join (CTA band xanh `#65774A`)
└── FooterSection (4 cột, `#F3ECDD`)
```

- Frame: `.landing-frame` trong từng section
- Motion: Framer Motion `fadeUp` trên card
- CTA chính: đăng ký → `/register`, xem hộp → `/boxes`

---

### 4.2 Auth

#### Login `/login` · Register `/register`

**Layout:** `.shell` 2 cột (`lg:grid-cols-[1fr_0.94fr]`)

| Cột trái (ẩn mobile) | Cột phải |
|----------------------|----------|
| `liquid-panel` — copy thương hiệu, blur orb trang trí | `hero-card` + `AuthForm` |

- Input: `rounded-[20px]`, `border-matcha-soft`, `bg-white/92`
- **Không render** `SiteHeader` (dù có import ở một số file)

#### Onboarding `/onboarding`

**Layout:** 1 card căn giữa trên `dashboard-shell-bg`

- Wizard 3 bước, progress bar, option pills `rounded-[24px]`
- Hoàn tất → `/dashboard`

---

### 4.3 Catalog & thanh toán

#### Product Catalog `/boxes`

**Layout:** `SiteHeader` + main `max-w-[1280px]` + `SiteFooter`

```
Hero text (title "Product Catalog")
[Optional] onboarding CTA 2 ô (khi ?onboarding=1)
Grid 5 ProductCard (responsive: 1→2→3→5 cột)
```

#### Chi tiết gói `/boxes/[slug]`

**Layout:** `.shell` 2 cột

| Trái | Phải |
|------|------|
| `soft-card` — badge, tên, duration, feature list ✓ | `CheckoutPanel` — giá, PayOS |

#### Checkout `/checkout`

**Layout:** `.shell` 2 cột — copy + illustration trái, `CheckoutPanel` phải (nếu đã login)

- Chưa login: gate `soft-card` với link login/register
- Query `?slug=` chọn gói thanh toán

#### Success `/checkout/success` · Cancel `/checkout/cancel`

- Card căn giữa (`hero-card` / `soft-card`)
- Link về dashboard hoặc boxes

---

### 4.4 Dashboard & tính năng

**Shell chung:** `DashboardShell` (`src/components/dashboard/dashboard-shell.tsx`)

```
┌──────────┬────────────────────────────────────────┐
│ Sidebar  │ dashboard-glass HEADER                 │
│ 262px    │  date · title · subtitle · plan · user │
│ (desktop)├────────────────────────────────────────┤
│          │ CONTENT (scroll)                       │
└──────────┴────────────────────────────────────────┘
Mobile: bottom nav 5 icon (Trang chủ → Hành trình)
```

| Route | Title (ví dụ) | Layout nội dung |
|-------|---------------|-----------------|
| `/dashboard` | Trang chủ | Mood modal, upsell banner, journey progress, quick actions 6 ô |
| `/journal` | Nhật ký | Tab pills: Viết ra / Nhật ký / Mood; hash `#release` `#journal` `#mood` |
| `/audio` | Âm thanh | Hub 2×2 category cards |
| `/audio/sleep` · `/meditation` | — | `AudioCategoryPage` — grid track + player overlay |
| `/audio/breathing` | — | `BreathingExercise` + upsell nếu free |
| `/audio/timer` | — | `MeditationTimer` |
| `/ai` | Lắng nghe | 2 cột: starter prompts + chat panel `min-h-[560px]` |
| `/journey` | Hành trình | Tab history/reports, calendar mood 21 ngày, streak |
| `/mood-test` | Mood Test | Quiz 7 câu, kết quả + gợi ý audio |
| `/account` | Account | Tab: Hộp / Đơn hàng / Quyền truy cập; danh sách 5 gói |
| `/settings` | Cài đặt | Stack `soft-card`: profile, privacy toggle, notifications, danger zone |

**Premium gating:** `UpsellOverlay` (blur + khóa) trên journal, audio locked, breathing, journey, mood-test lần 2.

---

### 4.5 Admin

| Route | Layout |
|-------|--------|
| `/admin` | `SiteHeader` + grid 4 card link + 3 stat |
| `/admin/users` | `.shell` — bảng + slide-over panel (không header app) |
| `/admin/orders` | `.shell` — bảng + select status inline |
| `/admin/reports` | `.shell` — nút generate + list báo cáo |

Admin hub khớp design system; sub-pages tối giản, gần raw HTML table.

---

## 5. Pattern tái sử dụng

### 5.1 Tab / pill toggle

```text
inline-flex rounded-full border border-white/70 bg-white/84 p-1
Active: bg-matcha text-white
Inactive: text-muted
```

Dùng tại: journal, journey, account, settings chips.

### 5.2 Form input

- Bo `rounded-[20px]`–`rounded-[22px]`
- Viền `border-matcha-soft` hoặc `border-white/70`
- Focus `ring-matcha/20 ring-4`

### 5.3 Upsell

| Component | Vị trí | Hành vi |
|-----------|--------|---------|
| `UpsellBanner` | Dashboard home | Honey gradient, dismiss sessionStorage |
| `UpsellOverlay` | Feature bị khóa | Blur + lock + CTA `/boxes` |

### 5.4 Navigation map

| Vai trò | Đích |
|---------|------|
| Sidebar desktop | 7 route + admin |
| Bottom nav mobile | 5 route đầu (thiếu Account, Settings) |
| FloatingNavbar | Anchor landing |
| SiteHeader | Marketing + admin entry |

---

## 6. Điểm mạnh UI

### 6.1 Nhận diện thương hiệu rõ ràng

- Palette matcha/champagne/cream **nhất quán** trên dashboard, journal, checkout, onboarding
- Serif headline + eyebrow pill tạo cảm giác **premium wellness**, khác biệt so với app productivity thuần
- Gradient nền body nhiều lớp — không gian “êm”, phù hợp sleep/mental health

### 6.2 Dashboard shell trưởng thành

- Sidebar glass + header có plan pill, avatar, logout — **context người dùng đầy đủ**
- Cùng một shell cho mọi tính năng app → học một lần, dùng khắp nơi
- Card hierarchy (`soft-card`, `dashboard-glass`) tạo chiều sâu mà không chói

### 6.3 Micro-interaction & motion có chủ đích

- Landing: Framer Motion hover/fade — không quá nặng
- Journal prompts, mood modal — cảm giác “mềm”, không transactional
- Audio player overlay — trải nghiệm immersive phù hợp category

### 6.4 Premium gating nhất quán về mặt UX

- `UpsellOverlay` pattern thống nhất: blur nội dung, không redirect đột ngột
- Free tier vẫn có mood check-in, viết ra — **cho nếm trước khi mua**, đúng funnel wellness

### 6.5 Copy & tone (phần lớn)

- Tiếng Việt thân thiện, không phán xét — khớp positioning “đồng hành giấc ngủ”
- Onboarding/journal language nhẹ nhàng, ít jargon

### 6.6 Catalog sản phẩm (sau cập nhật)

- 5 gói LUMIA rõ ràng, SAVER được highlight — dễ so sánh
- Feature list dùng checkmark ✓ — scan nhanh

---

## 7. Điểm yếu UI

### 7.1 Drift token & màu hardcode

| Vấn đề | Ví dụ |
|--------|-------|
| `/boxes` dùng hex riêng | `#f8f4eb`, `#2f2b25`, `#6f6b63`, `#2f2f2f` thay vì CSS variables |
| Nền landing vs boxes | `#F8F6EF` vs `#f8f4eb` — gần giống nhưng không cùng token |
| Màu lỗi ad hoc | `#9A5B5B` ở auth/AI — không có `--error` semantic |
| Chat bubble hardcode | `bg-[#DDE8D2]` thay vì `matcha-soft` |

**Rủi ro:** theme dark / rebrand tốn công sửa từng file.

### 7.2 Hai (ba) hệ navigation không thống nhất

- Landing: `FloatingNavbar` + anchor
- Marketing: `SiteHeader`
- App: `Sidebar`

Link set, style, và CTA **khác nhau** giữa các shell — user có thể “lạc” khi chuyển landing → app.

### 7.3 Mobile nav thiếu route

`Sidebar` bottom bar chỉ hiển thị **5 mục đầu** (`navigation.slice(0, 5)`):

- **Thiếu:** Account, Settings
- User mobile phải tìm đường khác (deep link, profile header?) để vào tài khoản/cài đặt

### 7.4 Không có component library atomic

- Button, input, toggle, modal **implement lại** theo từng feature
- Chỉ 2 file trong `components/ui/`
- Khó đảm bảo accessibility (focus ring, aria) đồng đều

### 7.5 Admin sub-pages “lột xác” visual

- `/admin` hub đẹp, còn users/orders/reports: bảng plain, input `rounded-xl` generic
- Không `SiteHeader` / `DashboardShell` — cảm giác **prototype nội bộ**

### 7.6 Song ngữ / copy lẫn lộn

| Chuỗi tiếng Anh | Vị trí |
|-----------------|--------|
| "Product Catalog" | `/boxes` title |
| "Account" | Sidebar, page title |
| "Mood Test" | Route title |
| "Feature matrix" | Account tab |

Phá vỡ tone Việt-first của phần còn lại.

### 7.7 Auth layout chưa hoàn thiện

- `SiteHeader` import nhưng không render — mất đường về home/boxes khi login
- Login vs Register: panel trái **không đối xứng** (login có placeholder ảnh, register có copy đầy đủ hơn)

### 7.8 Placeholder & nội dung chưa final

- Landing boxes showcase: *"Ảnh box sẽ được cập nhật sau"*
- ProductCard dùng SVG editorial chung — chưa ảnh sản phẩm thật theo catalog
- Footer social — placeholder buttons

### 7.9 Accessibility & responsive edge cases

- Video hero landing — cần kiểm tra `prefers-reduced-motion`
- Bảng feature matrix account — `overflow-x-auto` nhưng chưa tối ưu mobile
- Một số headline `text-[4.6rem]` — có thể tràn trên màn hình nhỏ

### 7.8 Checkout flow phân mảnh

- Mua tại `/boxes/[slug]` và `/checkout?slug=` — hai entry, cần đảm bảo user không bối rối
- Success page link `/subscription` (redirect `/account`) — thêm một hop không cần thiết

---

## 8. Ma trận ưu tiên cải thiện

| Ưu tiên | Hạng mục | Effort |
|---------|----------|--------|
| P0 | Sửa mobile nav — thêm Account/Settings hoặc menu “More” | Thấp |
| P0 | Thống nhất token trên `/boxes` về CSS variables | Thấp |
| P1 | Việt hóa "Product Catalog", "Account", "Feature matrix" | Thấp |
| P1 | Trích `Input`, `Button`, `TabPills` vào `components/ui/` | Trung bình |
| P1 | Admin sub-pages dùng cùng shell hoặc admin sidebar | Trung bình |
| P2 | Ảnh sản phẩm thật cho catalog & landing | Trung bình |
| P2 | Thêm `--error`, `--success` semantic tokens | Thấp |
| P2 | Auth pages: render header hoặc logo link về `/` | Thấp |
| P3 | Dark mode (nếu roadmap có) | Cao |

---

## 9. File tham chiếu

| Nhóm | Path |
|------|------|
| Tokens & global CSS | `src/app/globals.css`, `src/styles/fonts.css`, `src/styles/theme.css` |
| Catalog sản phẩm | `src/data/catalog.ts` |
| Dashboard shell | `src/components/dashboard/dashboard-shell.tsx`, `sidebar.tsx` |
| Marketing shell | `src/components/marketing/site-header.tsx`, `site-footer.tsx` |
| Landing | `src/app/page.tsx`, `src/components/landing/**` |
| Premium gating | `src/components/ui/upsell-overlay.tsx`, `upsell-banner.tsx` |
| Product UI | `src/components/marketing/product-card.tsx`, `checkout-panel.tsx` |

---

## 10. Changelog

| Ngày | Thay đổi |
|------|----------|
| 2026-06-11 | Khởi tạo document; catalog 5 gói LUMIA; đánh giá UI hiện trạng |

---

*Tài liệu này là **snapshot** design contract — cập nhật khi có thay đổi lớn về shell, token, hoặc IA navigation.*
