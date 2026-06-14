# LUMIA Web — Layout từng trang

> Mô tả chi tiết cấu trúc UI/layout cho mọi route trong `lumia-web`.  
> Phiên bản: 2026-06-13 · Route groups: `(public)` `(marketing)` `(auth)` `(app)`

Tài liệu này bổ sung cho [DESIGN_CONTRACT.md](./DESIGN_CONTRACT.md) — tập trung vào **cấu trúc vùng nội dung từng màn hình**, không lặp lại token hay đánh giá UI.

---

## Mục lục

1. [Shell dùng chung](#1-shell-dùng-chung)
2. [Landing & Marketing](#2-landing--marketing)
3. [Auth & Onboarding](#3-auth--onboarding)
4. [Catalog & Thanh toán](#4-catalog--thanh-toán)
5. [Dashboard & tính năng app](#5-dashboard--tính-năng-app)
6. [Admin](#6-admin)
7. [Redirect routes](#7-redirect-routes)
8. [Bảng tóm tắt](#8-bảng-tóm-tắt)

---

## 1. Shell dùng chung

### 1.1 Shell A — Landing (`src/app/(public)/`)

Layout: `LandingShell` — `FloatingNavbar` + 8 sections + `SiteFooter`.

| Section | Component |
|---------|-----------|
| Hero | `hero-section` |
| Ecosystem | `categories-section` |
| Ritual | `ritual-accordion-section` (#nghi-thuc) |
| Packages | `boxes-showcase-section` (#goi-lumia) |
| Listen | `ai-listening-section` (#lang-nghe) |
| App | `webapp-demo-section` (#web-app) |
| Stories | `testimonials-section` (#cau-chuyen) |
| Join | `join-section` |

| Thành phần | File |
|------------|------|
| Shell | `src/components/shell/landing-shell.tsx` |
| Navbar | `src/components/landing/shared/floating-navbar.tsx` |
| Footer | `src/components/marketing/site-footer.tsx` |

---

### 1.2 Shell B — Marketing (`src/app/(marketing)/`)

Layout: `MarketingShell` — `SiteHeader` + `main` + `SiteFooter` (ẩn footer trên `/checkout/*`).

| Route | Ghi chú |
|-------|---------|
| `/boxes`, `/quiz`, `/onboarding` | Footer có |
| `/checkout/*` | Chỉ header, stepper funnel |

| Thành phần | File |
|------------|------|
| Shell | `src/components/shell/marketing-shell.tsx` |
| Nav config | `src/lib/site-nav.ts` |
| Header | `src/components/marketing/site-header.tsx` |
| Footer | `src/components/marketing/site-footer.tsx` (4 cột) |

---

### 1.3 Shell C — App (`src/app/(app)/`)

**Single mount:** `dashboard-shell-layout.tsx` render `{children}` một lần; sidebar desktop + mobile header/tab trong một grid.

Sidebar desktop gồm: Hôm nay, Lắng nghe, Nhật ký, Âm thanh, Sleep Coach, Streak, Gói, **Cài đặt**, theme toggle, logout.

Mobile: 5-tab bar + More sheet (journal, settings, logout).

| Thành phần | File |
|------------|------|
| Shell wrapper | `src/components/dashboard/dashboard-shell.tsx` |
| Layout | `src/components/dashboard/dashboard-shell-layout.tsx` |
| Sidebar | `src/components/dashboard/sidebar.tsx` |
| Mobile tab bar | `src/components/mobile/mobile-tab-bar.tsx` |
| Mobile more sheet | `src/components/mobile/mobile-more-sheet.tsx` |
| Mobile header | `src/components/mobile/mobile-app-header.tsx` |

---

### 1.4 Shell D — Auth (`src/app/(auth)/`)

Layout: `AuthShell` — logo header + theme toggle + 2-col form (`hero-card` + brand panel).

| File | `src/components/shell/auth-shell.tsx`, `auth-form.tsx` |

---

### 1.5 Shell E — Admin sub-page

Dùng cho `/admin/users`, `/admin/orders`, `/admin/reports`. Không có `SiteHeader` hay `DashboardShell`.

```
AdminPageShell
├── Link "← Quản trị" → /admin
├── H1 tiêu đề trang
└── Nội dung (bảng / form / list)
```

| File | `src/components/admin/admin-page-shell.tsx` |

---

### 1.6 UpsellOverlay (premium gating)

Component blur + khóa nội dung + CTA "Xem các gói LUMIA" → `/boxes`.

| File | `src/components/ui/upsell-overlay.tsx` |

---

## 2. Landing & Marketing

### `/` — Landing

| | |
|---|---|
| **Shell** | Landing |
| **Page** | `src/app/(public)/page.tsx` |

**Cây layout:**

```
LandingPage (.landing-page)
├── FloatingNavbar
│   ├── Anchor links (Đồng hành, Hộp LUMIA, Lắng nghe AI, Cảm nhận)
│   ├── Đăng nhập → /login
│   └── CTA "Bắt đầu" → /register
│
├── HeroSection (min-h viewport)
│   ├── Video nền (loop, muted)
│   ├── Eyebrow pill
│   ├── H1 serif
│   ├── Mô tả ngắn
│   └── 2 CTA: Đăng ký · Xem hộp LUMIA
│
├── RitualStepsSection (#dong-hanh)
│   └── Grid 3 card (bước ritual)
│
├── BoxesShowcaseSection (#hop-lumia)
│   ├── Heading + mô tả
│   └── Grid 5 gói catalog (teaser cards)
│
├── AiListeningSection
│   ├── Cột trái: copy + bullet benefits
│   └── Cột phải: mock chat UI + 3 info cards
│
├── TestimonialsSection (#testimonials)
│   └── Scroll wall (mobile 1 cột · desktop 3 cột song song)
│
├── JoinSection
│   ├── Band nền xanh đậm (#65774A)
│   ├── H2 + mô tả
│   └── Form email (input + CTA)
│
└── FooterSection (#F3ECDD)
    ├── 4 cột links (Sản phẩm, Hỗ trợ, Pháp lý, Liên hệ)
    └── Social placeholder buttons
```

**Responsive:**

| Vùng | Breakpoint | Hành vi |
|------|------------|---------|
| Navbar | scroll | Thu thành pill glass |
| Ritual steps | `md+` | `grid-cols-3` |
| Boxes grid | `md → xl → 2xl` | 2 → 3 → 5 cột |
| Testimonials | mobile vs desktop | 1 cột scroll vs 3 cột |
| Join form | `sm+` | `flex-row` |

**Premium:** Không.

---

## 3. Auth & Onboarding

### `/login`

| | |
|---|---|
| **Shell** | Auth minimal |
| **Page** | `src/app/login/page.tsx` |

```
LoginPage
├── AuthMinimalHeader
└── main.shell (lg:grid-cols-[1fr_0.94fr])
    ├── [hidden lg:flex] liquid-panel
    │   ├── Blur orbs trang trí
    │   ├── H1 "Chào mừng bạn quay lại..."
    │   └── Info card (copy riêng tư)
    └── hero-card
        ├── AuthForm (email, password, submit)
        └── Link → /register
```

**Query:** `?next=` — redirect sau login (mặc định `/dashboard`).

**Responsive:** Panel trái ẩn trên mobile; form full width.

---

### `/register`

| | |
|---|---|
| **Shell** | Auth minimal |
| **Page** | `src/app/register/page.tsx` |

Cấu trúc giống `/login`, khác biệt:

| Khác biệt | Chi tiết |
|-----------|----------|
| Panel trái | Eyebrow "Đăng ký", copy onboarding |
| AuthForm | mode `register`: name, email, password, confirm |
| Password fields | Grid 2 cột `md+` |
| Redirect | Mặc định `/onboarding` |
| Footer link | → `/login` |

---

### `/onboarding`

| | |
|---|---|
| **Shell** | Standalone (không header) |
| **Page** | `src/app/onboarding/page.tsx` |

```
OnboardingPage (marketing-page, flex center)
└── soft-card (max-w-2xl)
    ├── Progress bar (3 segment)
    ├── Eyebrow "Bước X/3"
    ├── H1 câu hỏi wizard
    ├── 3 option pills (rounded-[24px])
    ├── [bước 2+] Nút "Quay lại"
    └── Error message (nếu có)
```

**Wizard 3 bước:**

| Bước | Câu hỏi | Lưu field |
|------|---------|-----------|
| 1 | Mục tiêu chính | `onboarding_goal` |
| 2 | Giờ đi ngủ thường | `bedtime` |
| 3 | Kinh nghiệm thiền/sleep | `experience` |

**Hoàn tất:** POST profile → redirect `/dashboard`.

**Responsive:** Mobile `rounded-t-[28px]` bottom sheet style; desktop centered `lg:rounded-[30px]`.

---

## 4. Catalog & Thanh toán

### `/boxes` — Product Catalog

| | |
|---|---|
| **Shell** | Marketing + SiteHeader + SiteFooter |
| **Page** | `src/app/boxes/page.tsx` |

```
BoxesPage (.catalog-page)
├── SiteHeader
├── main (max-w-[1280px])
│   ├── Hero text (centered)
│   │   ├── Eyebrow
│   │   ├── H1 "Bộ sưu tập hộp LUMIA"
│   │   └── Mô tả
│   │
│   ├── [?onboarding=1] CTA strip (2 card)
│   │   ├── Gói người dùng mới → /boxes/first-time-user
│   │   └── Dùng thử miễn phí → /dashboard hoặc /register
│   │
│   └── products-grid
│       └── ProductCard × 5 (từ lumiaBoxes)
│
├── catalog-footer-strip (features · lumia.vn)
└── SiteFooter
```

**ProductCard mỗi item:**

```
ProductCard
├── Badge (GÓI TIẾT KIỆM nếu SAVER)
├── Tên gói + duration
├── Giá
├── Feature list (✓)
└── CTA → /boxes/[slug]
```

**Premium gating:** Gói `first-time-user` disabled nếu user đã mua (`hasUserBoughtFirstTime`).

**Responsive:** Grid qua class `products-grid`; onboarding strip `md:grid-cols-2`.

---

### `/boxes/[slug]` — Chi tiết gói

| | |
|---|---|
| **Shell** | Marketing + SiteHeader + SiteFooter |
| **Page** | `src/app/boxes/[slug]/page.tsx` |

```
BoxDetailPage
├── SiteHeader
├── main.shell (lg:grid-cols-[1.1fr_0.9fr])
│   ├── soft-card / product detail
│   │   ├── Badge tier
│   │   ├── Tên + duration
│   │   ├── Mô tả
│   │   └── Feature lists (included / not included)
│   └── CheckoutPanel
│       ├── Giá + billing note
│       ├── PayOS button
│       └── [unavailable] overlay → link STANDARD
└── SiteFooter
```

**Responsive:** 1 cột mobile, 2 cột `lg+`.

---

### `/checkout`

| | |
|---|---|
| **Shell** | Marketing + SiteHeader (không footer) |
| **Page** | `src/app/checkout/page.tsx` |

```
CheckoutPage
├── SiteHeader
└── main.shell (lg: 2 cột)
    ├── Cột trái
    │   ├── Eyebrow + H1
    │   ├── Mô tả PayOS
    │   ├── Hero illustration
    │   └── [chưa login] soft-card
    │       ├── "Đăng nhập để thanh toán"
    │       └── Links: /login · /register
    └── Cột phải
        └── [đã login] CheckoutPanel
```

**Query:** `?slug=` (mặc định `first-time-user`).

---

### `/checkout/success`

| | |
|---|---|
| **Shell** | Marketing + SiteHeader |
| **Page** | `src/app/checkout/success/page.tsx` |

```
SuccessPage
└── hero-card (centered, max-w-lg)
    ├── Eyebrow "Đã ghi nhận"
    ├── H1 + mô tả thanh toán
    ├── Gradient tip box
    └── CTAs: /dashboard · /account
```

---

### `/checkout/cancel`

| | |
|---|---|
| **Shell** | Marketing + SiteHeader |
| **Page** | `src/app/checkout/cancel/page.tsx` |

```
CancelPage
└── soft-card (centered)
    ├── Eyebrow + H1
    ├── Mô tả hủy thanh toán
    └── CTAs: /boxes · /checkout
```

---

## 5. Dashboard & tính năng app

### `/dashboard` — Trang chủ

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/dashboard/page.tsx` |
| **Content** | `src/components/dashboard/dashboard-home.tsx` |

```
DashboardShell
└── DashboardHome
    ├── MoodCheckInPanel (hub check-in thống nhất)
    ├── UpsellBanner (free users, dismiss → sessionStorage)
    │
    ├── [mobile only] Greeting block "Hôm nay"
    │
    ├── [có physical box] Status banner hộp quà
    │
    ├── [subscription active] Subscription card
    │   ├── Tier name + days remaining
    │   ├── Streak counter
    │   └── Progress bar (period)
    │
    ├── [expired] Renewal CTA → /boxes
    │
    ├── [có mood hôm nay] Mood chip (X/5)
    │
    ├── [active + onboarding goal] Gợi ý hôm nay (motion card)
    │
    ├── Quick actions (6 cards)
    │   ├── Viết ra → /journal#release
    │   ├── Viết nhật ký → /journal#journal
    │   ├── Nghe thiền → /audio/meditation
    │   ├── Sleep sounds → /audio/sleep
    │   ├── Bài thở → /audio/breathing
    │   └── Nói chuyện → /ai
    │
    └── [free] Upsell section → /boxes
```

**Responsive:** Quick actions `mobile-h-scroll` → `lg:grid-cols-3`.

**Premium:** `UpsellBanner` + upsell section khi free; mood modal cho mọi user.

---

### `/journal` — Nhật ký

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/journal/page.tsx` |
| **Content** | `src/components/dashboard/journal-studio.tsx` |

```
DashboardShell
└── JournalStudio
    ├── TabPills (sticky mobile, fullWidth)
    │   ├── Viết ra
    │   ├── Nhật ký
    │   └── Mood
    │
    └── Tab content (hash routing)
        │
        ├── #release (FREE)
        │   └── hero-card
        │       ├── Textarea
        │       ├── Nút "Xả đi"
        │       └── Saved message
        │
        ├── #journal (PREMIUM)
        │   └── UpsellOverlay (nếu free)
        │       └── lg:grid-cols-2
        │           ├── Textarea nhật ký
        │           └── Prompt cards (scroll ngang mobile)
        │
        └── #mood (PREMIUM)
            └── UpsellOverlay (nếu free)
                ├── Emoji picker (5 mức)
                ├── Note textarea
                └── Nút "Lưu"
```

**Hash:** `#release` · `#journal` · `#mood`

---

### `/audio` — Hub âm thanh

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/audio/page.tsx` |

```
DashboardShell
└── Audio Hub
    ├── FeaturedTrackOfDay
    │   ├── soft-card (track info)
    │   └── CTA "Nghe ngay" → AudioPlayerOverlay
    │
    ├── Category links (2 items)
    │   ├── Sleep → /audio/sleep
    │   └── Meditation → /audio/meditation
    │   (mobile: list-row · desktop: soft-card grid 2 cols)
    │
    ├── AudioHubExtras
    │   ├── Breathing → /audio/breathing (UpsellOverlay nếu free)
    │   └── Timer → /audio/timer (UpsellOverlay nếu free)
    │
    └── Mood test CTA card → /mood-test
```

---

### `/audio/sleep`

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/audio/sleep/page.tsx` |
| **Content** | `AudioCategoryPage` |

```
DashboardShell
└── AudioCategoryPage
    ├── Section: Sleep Sounds
    │   └── Grid track cards (sm:2 · lg:3)
    ├── Section: Sleep Cast (activeOnly → UpsellOverlay nếu free)
    ├── Section: Wind Down (activeOnly)
    ├── Section: Sleep Music
    └── AudioPlayerOverlay (modal fullscreen player)
```

**Premium:** Track free phát được; track locked + section `activeOnly` gated.

---

### `/audio/meditation`

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/audio/meditation/page.tsx` |

```
DashboardShell
└── AudioCategoryPage
    ├── Section: Guided Meditation
    ├── Section: Mini Meditations
    ├── AudioPlayerOverlay
    └── soft-card: links → /audio/breathing · /audio/timer
```

---

### `/audio/breathing`

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/audio/breathing/page.tsx` |
| **Content** | `src/components/audio/breathing-exercise.tsx` |

```
DashboardShell
└── UpsellOverlay (toàn trang nếu free)
    └── BreathingExercise
        ├── [idle] Grid 3 technique cards
        │   ├── 4-7-8
        │   ├── Box breathing
        │   └── Coherent
        │
        ├── [active] Fullscreen overlay (fixed inset-0)
        │   ├── Animated circle (phase indicator)
        │   ├── Phase label + countdown
        │   └── Nút đóng
        │
        └── [done] Completion screen + "Thử lại"
```

**Responsive:** Technique grid `md:grid-cols-3`; session fullscreen.

---

### `/audio/timer`

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/audio/timer/page.tsx` |
| **Content** | `src/components/audio/meditation-timer.tsx` |

```
DashboardShell
└── UpsellOverlay (toàn trang nếu free)
    └── MeditationTimer
        ├── [setup] soft-card
        │   ├── Duration pills (5–30 phút)
        │   ├── Ambient track pills
        │   └── Nút "Bắt đầu"
        │
        └── [running]
            ├── Circular progress SVG
            ├── Thời gian còn lại
            └── Pause / Stop
```

---

### `/ai` — Lắng nghe (chat)

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/ai/page.tsx` |
| **Content** | `src/components/dashboard/ai-studio.tsx` |

```
DashboardShell
└── AiStudio (lg:grid 2 cột, min-h-[560px])
    ├── [xl+] Sidebar
    │   ├── Starter prompt list (click → gửi)
    │   └── Usage counter (X/Y hôm nay)
    │
    └── Chat panel (soft-card)
        ├── [lg+] Header disclaimer
        ├── Message area
        │   ├── User bubbles (phải)
        │   └── Assistant bubbles (trái, bg matcha-soft)
        ├── [mobile, empty] Horizontal starter chips
        ├── [limit = 0] Inline upsell banner → /boxes
        ├── Usage counter (mobile, bottom)
        └── Input bar
            ├── Textarea
            └── Send button
```

**Responsive:**

| Phần | Mobile | Desktop |
|------|--------|---------|
| Starter prompts | Chips ngang | Sidebar `xl+` |
| Input bar | `fixed` (trên tab bar) | `static` trong panel |
| Layout | 1 cột | `lg:grid-cols-[0.9fr_1.1fr]` |

**Premium:** Free 3 lượt/ngày; hết lượt → block input + upsell (không full-page overlay).

---

### `/journey` — Hành trình

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/journey/page.tsx` |
| **Content** | `src/components/dashboard/journey-panel.tsx` |

```
DashboardShell
└── UpsellOverlay (toàn panel nếu free)
    └── JourneyPanel
        ├── TabPills: Lịch sử | Báo cáo
        │
        ├── [Lịch sử]
        │   ├── Stats row (3 cards)
        │   │   ├── Streak
        │   │   ├── Mood trung bình
        │   │   └── Top activity
        │   ├── Calendar grid (7 cols × N tuần)
        │   │   └── Mood color dots
        │   └── Selected day detail card
        │
        └── [Báo cáo]
            ├── Nút generate (tuần / 21 ngày)
            └── Report list (expandable articles)
```

**Responsive:** Stats `sm:grid-cols-3`; calendar `grid-cols-7`.

---

### `/mood-test`

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/mood-test/page.tsx` |
| **Content** | `src/components/dashboard/mood-test-quiz.tsx` |

```
DashboardShell
└── MoodTestQuiz
    ├── [free + đã làm] UpsellOverlay + kết quả cũ
    │
    ├── [quiz] 7 câu
    │   ├── Progress bar
    │   ├── Câu hỏi
    │   └── 4 option buttons
    │
    └── [result]
        ├── Mood label + mô tả
        ├── Gợi ý audio → /audio/*
        └── CTA: "Mở khóa" (free) · "Thử lại" (premium)
```

**Premium:** Free chỉ làm 1 lần; premium unlimited.

---

### `/account` — Tài khoản

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/account/page.tsx` |
| **Content** | `src/components/dashboard/account-panel.tsx` |

```
DashboardShell
└── AccountPanel
    ├── TabPills
    │   ├── Hộp của tôi
    │   ├── Đơn hàng
    │   └── Quyền của tôi
    │
    ├── [Hộp của tôi]
    │   ├── Plan info + expiry
    │   ├── Progress bar
    │   ├── Physical box status
    │   └── [free] Upsell product cards → /boxes/[slug]
    │
    ├── [Đơn hàng]
    │   └── Order list cards (status, date, amount)
    │
    └── [Quyền của tôi]
        └── Feature matrix table
            (Dùng thử vs Đang dùng — overflow-x mobile)
```

---

### `/settings` — Cài đặt

| | |
|---|---|
| **Shell** | DashboardShell |
| **Page** | `src/app/settings/page.tsx` |
| **Content** | `src/components/dashboard/settings-panel.tsx` |

```
DashboardShell
└── SettingsPanel (stack soft-card)
    ├── Mục tiêu
    │   ├── View mode / Edit mode (radio options)
    │   └── Nút "Lưu"
    │
    ├── Thông tin cá nhân (md:grid-cols-2)
    │   ├── Name input
    │   └── Email input (read-only)
    │
    ├── Quyền riêng tư (3 toggle switches)
    │
    ├── Thông báo (3 toggle switches)
    │
    ├── Cá nhân hóa (md:grid-cols-2)
    │   ├── Bedtime time input
    │   └── Response style pills
    │
    ├── Danger zone
    │   ├── Xóa dữ liệu
    │   └── Xóa tài khoản
    │
    └── Modal xác nhận (fixed overlay)
```

**Premium:** Không gate — mọi user truy cập settings.

---

## 6. Admin

### `/admin` — Hub quản trị

| | |
|---|---|
| **Shell** | Marketing + SiteHeader |
| **Page** | `src/app/admin/page.tsx` |
| **Auth** | `requireRole(["admin"])` |

```
AdminPage
├── SiteHeader
└── main.shell
    ├── Eyebrow + H1
    ├── Grid 4 nav cards
    │   ├── Đơn hàng → /admin/orders
    │   ├── Người dùng → /admin/users
    │   ├── Báo cáo → /admin/reports
    │   └── Shop → /boxes
    └── Stats row (3 cards: users, orders, reports count)
```

**Responsive:** Nav `lg:grid-cols-4`; stats `md:grid-cols-3`.

---

### `/admin/users`

| | |
|---|---|
| **Shell** | AdminPageShell |
| **Page** | `src/app/admin/users/page.tsx` |

```
AdminPageShell
├── Link ← Quản trị
├── H1 "Người dùng"
├── Search input (filter email)
├── Data table (7 cột, min-w 720px)
│   └── Horizontal scroll mobile
└── [row click] Fixed drawer (right, max-w-md)
    ├── User detail fields
    └── Actions (role, tier, ...)
```

---

### `/admin/orders`

| | |
|---|---|
| **Shell** | AdminPageShell |
| **Page** | `src/app/admin/orders/page.tsx` |

```
AdminPageShell
├── Link ← Quản trị
├── H1 + status filter select
├── Orders table (8 cột, min-w 900px)
│   ├── OrderStatusBadge
│   └── Inline status select (per row)
└── Toast message
```

---

### `/admin/reports`

| | |
|---|---|
| **Shell** | AdminPageShell |
| **Page** | `src/app/admin/reports/page.tsx` |

```
AdminPageShell
├── Link ← Quản trị
├── H1
├── Action buttons
│   ├── Tạo báo cáo tuần
│   └── Tạo báo cáo 21 ngày
├── Status message
└── Report list (soft-card articles, expandable)
```

---

## 7. Redirect routes

Các route không có UI riêng — chỉ redirect:

| Route | Redirect | File |
|-------|----------|------|
| `/dashboard/boxes` | `/account` | `src/app/dashboard/boxes/page.tsx` |
| `/subscription` | `/account` | `src/app/subscription/page.tsx` |
| `/history` | `/journey` | `src/app/history/page.tsx` |

---

## 8. Bảng tóm tắt

### Shell theo route

| Route | Shell |
|-------|-------|
| `/` | Landing |
| `/login`, `/register` | Auth minimal |
| `/onboarding` | Standalone |
| `/boxes`, `/boxes/[slug]` | Marketing |
| `/checkout`, `/checkout/success`, `/checkout/cancel` | Marketing |
| `/dashboard`, `/journal`, `/audio/**`, `/ai`, `/journey`, `/mood-test`, `/account`, `/settings` | DashboardShell |
| `/admin` | Marketing |
| `/admin/users`, `/admin/orders`, `/admin/reports` | AdminPageShell |
| `/dashboard/boxes`, `/subscription`, `/history` | Redirect |

### Premium gating

| Trang / Tính năng | Free | Premium (`isActive`) |
|-------------------|------|----------------------|
| Viết ra (journal) | ✓ | ✓ |
| Nhật ký + Mood tab | UpsellOverlay | ✓ |
| AI Chat | 3 lượt/ngày | Không giới hạn |
| Audio free tracks | ✓ | ✓ |
| Audio premium / activeOnly sections | Locked | ✓ |
| Breathing, Timer | UpsellOverlay | ✓ |
| Hành trình | UpsellOverlay | ✓ |
| Mood test | 1 lần | Unlimited |
| Dashboard UpsellBanner | Hiện | Ẩn |
| Gói first-time | 1 lần/user | — |

### Modals & overlays toàn app

| Component | Xuất hiện tại |
|-----------|---------------|
| `MoodCheckInPanel` | `/dashboard` |
| `AudioPlayerOverlay` | `/audio`, `/audio/sleep`, `/audio/meditation` |
| Breathing fullscreen | `/audio/breathing` (khi chọn kỹ thuật) |
| `MobileMoreSheet` | Mọi trang DashboardShell (mobile) |
| Settings danger modal | `/settings` |
| Admin user drawer | `/admin/users` |
| `UpsellOverlay` | journal, audio locked, breathing, timer, journey, mood-test |

---

## Changelog

| Ngày | Thay đổi |
|------|----------|
| 2026-06-11 | Khởi tạo tài liệu layout chi tiết; tách từ DESIGN_CONTRACT §4 |

---

*Tài liệu snapshot — cập nhật khi thêm route mới hoặc thay đổi shell/component layout.*
