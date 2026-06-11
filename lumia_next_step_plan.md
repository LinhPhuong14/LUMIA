# LUMIA — Next Step Plan v1.0

## Context

Codebase hiện tại đang dùng MongoDB + custom JWT auth, lệch spec lớn.
Quyết định: **Option B — Migrate toàn bộ sang Supabase theo spec.**

Thứ giữ lại từ codebase cũ:
- PayOS webhook logic (verify signature)
- Landing page + Dashboard UI shell
- proxy.ts route guard pattern

Thứ rewrite hoặc xóa:
- Auth (jose + bcrypt → Supabase Auth)
- Subscription model (tier tháng → 21 ngày free/active/expired)
- Toàn bộ Mongoose models → Supabase Postgres schema
- Activation code flow (trái spec — xóa hoàn toàn)

---

## Nguyên tắc thực thi

> **Không build Phase 2 khi Phase 0 chưa xong.**
> Phase 0 là hard blocker — không negotiate.
> Mỗi Phase phải pass Checkpoint trước khi sang Phase tiếp theo.

---

## Phase 0 — Kiến trúc & Setup (Ngày 1–2)

**Mục tiêu:** Supabase chạy được local, schema đúng spec, auth mới hoạt động. Không build feature mới.

### Task 0.1 — Supabase Project Setup
- Tạo Supabase project (free tier)
- Lấy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Cập nhật `.env.local`
- Install dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm uninstall mongoose jose bcrypt
  ```

### Task 0.2 — Migration Schema
Tạo `supabase/migrations/001_initial_schema.sql` với đầy đủ các bảng theo spec:

```sql
-- profiles, subscriptions, orders
-- journal_entries, mood_checkins, mood_test_results
-- chat_sessions, chat_messages, chat_daily_usage
-- audio_tracks, activity_logs, streaks, reports
```

Thêm RLS policies cho từng bảng. Chạy migration lên Supabase.

### Task 0.3 — Replace Auth
- **Xóa:** `src/lib/auth.ts`, `src/lib/session.ts`
- **Tạo mới:**
  - `src/lib/supabase/client.ts` — browser client
  - `src/lib/supabase/server.ts` — server component client
  - `src/lib/supabase/middleware.ts` — session refresh
- **Rewrite** `proxy.ts` → dùng Supabase session thay JWT cookie
- **Rewrite API routes:**
  - `/api/auth/register` → `supabase.auth.signUp()` + insert `profiles`
  - `/api/auth/login` → `supabase.auth.signInWithPassword()`
  - `/api/auth/logout` → `supabase.auth.signOut()`
- Giữ nguyên UI của `/login`, `/register` — chỉ đổi API call

### Task 0.4 — Remove MongoDB
- Xóa: `src/lib/db/mongoose.ts`, `src/models/index.ts`
- Xóa dependency: `mongoose`
- Xóa: `src/app/activate/` (activation code — trái spec)
- Xóa: `src/data/catalog.ts` 3 tier → thay bằng 1 box object đơn giản
- Xóa: `src/next-app/` folder thừa
- Giữ và rewrite: `src/lib/payos.ts`, `src/lib/orders.ts` → dùng Supabase

### Task 0.5 — Seed Data Mới
- Rewrite `/api/seed`: insert admin user vào `profiles` (role = admin)
- Insert 5–10 `audio_tracks` mẫu vào DB
- Test đăng ký / đăng nhập / đăng xuất hoạt động

**✅ Checkpoint Phase 0:**
Đăng ký → đăng nhập → đăng xuất hoạt động với Supabase Auth.
Schema đầy đủ visible trên Supabase dashboard. Không còn MongoDB dependency.

---

## Phase 1 — Subscription & Payment Core (Ngày 3–4)

**Mục tiêu:** Flow mua box → thanh toán → nhận hàng → bắt đầu 21 ngày hoạt động end-to-end đúng spec.

### Task 1.1 — Rewrite Subscription Logic
- Xóa: `grantEntitlement()`, tier tháng, `ActivationCode` flow
- Tạo `src/lib/subscriptions.ts` mới:
  ```typescript
  getSubscriptionStatus(userId)  // → 'free' | 'active' | 'expired'
  startJourney(userId)           // → set started_at, expires_at = +21d
  checkAccess(userId, feature)   // → boolean
  getCurrentDay(userId)          // → number 1–21 | null
  ```

### Task 1.2 — Rewrite PayOS Webhook
- Giữ: verify signature logic
- **Đổi logic sau verify:**
  ```
  Cũ: grantEntitlement() ngay → unlock
  Mới:
    - Update orders: status = 'paid'
    - Upsert subscriptions: status = 'active', started_at = NULL
    - KHÔNG set started_at, KHÔNG unlock ngay
  ```

### Task 1.3 — Order Status Flow
- Enum đúng spec: `paid → preparing → shipping → delivered`
- API: `PATCH /api/admin/orders/[id]/status`
- Dashboard user: hiển thị trạng thái đơn hàng hiện tại
- Logic: khi `status = delivered` → hiển thị nút **"Bắt đầu hành trình 21 ngày"**

### Task 1.4 — Start Journey API
- `POST /api/subscriptions/start`
  - Verify: `order.status = 'delivered'`
  - Verify: `subscription.status = 'active'`, `started_at = null`
  - Set: `started_at = now()`, `expires_at = now() + 21 days`
- UI: nút "Bắt đầu" trên dashboard → call API → refresh subscription state

### Task 1.5 — Onboarding Quiz
- Rewrite `/onboarding` page: đúng 3 câu theo spec
  - Lựa chọn: **Ngủ tốt hơn / Giảm stress / Tập thiền**
- Lưu vào `profiles.onboarding_goal`
- Flow: sau register → `/onboarding` → `/dashboard`
- Xóa `supportGoal` cũ trong `AuthForm`

### Task 1.6 — Tier Gating Middleware
- Rewrite `proxy.ts`: thêm subscription check
- Server component helper: `requireActiveSubscription()`
- Logic check:
  ```
  status === 'active'
  AND started_at IS NOT NULL
  AND expires_at > now()
  ```
- Các route cần gate (active only): `/journal` (write), `/audio` (full), `/chat`, `/mood-test`, `/reports`

**✅ Checkpoint Phase 1:**
Flow end-to-end: Mua box → PayOS thanh toán → admin cập nhật `delivered` → user click bắt đầu → full access unlock.
Hết 21 ngày → `expired` → về free tier. Tier gating hoạt động đúng.

---

## Phase 2 — Core Features (Ngày 5–8)

**Mục tiêu:** Journal, Mood, Audio, Streak hoạt động thật — không còn mock hay hardcode.

### Task 2.1 — Mood Check-in
- `POST /api/mood` → insert `mood_checkins`
- `GET /api/mood/history` → query 7/30 ngày gần nhất
- Wire dashboard mood check-in UI → API (xóa local state mock)
- Build mood history chart (recharts)
- Log activity: insert `activity_logs` với `type = 'mood'`

### Task 2.2 — Journal
- `POST /api/journal` → insert `journal_entries` (active tier only)
- `GET /api/journal` → list entries của user, sort by date
- `GET /api/journal/[date]` → entry theo ngày
- `PUT /api/journal/[date]` → update entry
- `GET /api/journal/prompts` → trả về prompt gợi ý ngẫu nhiên (xoay vòng)
- Wire `JournalStudio` UI → API (xóa local state mock)
- Free tier: disable write UI + hiển thị upsell banner
- Log activity: `type = 'journal'`

### Task 2.3 — Audio Library
- `GET /api/audio` → list tracks, filtered by:
  - `is_free` (tracks cho free user)
  - `category` (sleep_sound, sleep_cast, wind_down, sleep_music, guided_meditation, mini_meditation)
- `GET /api/audio/[id]/url` → Supabase Storage signed URL (expire 1h)
- Upload audio files lên Supabase Storage bucket `audio`
- Build `/audio/sleep` và `/audio/meditation` pages với category filter
- Build audio player component (HTML5 Audio API + custom UI)
- Log activity: `type = 'audio'`

### Task 2.4 — Streak & Activity Tracking
- `POST /api/streak/log` → upsert `activity_logs` + update `streaks`
  ```
  Logic:
  last_active_date = yesterday → current_streak + 1
  last_active_date = today     → no change (đã tính)
  gap > 1 ngày                 → reset current_streak = 1
  Update longest_streak nếu current > longest
  ```
- `GET /api/streak` → current streak + longest streak + badges earned
- Dashboard: progress bar 21 ngày, streak counter
- Badges milestone: Ngày 7 / Ngày 14 / Ngày 21
- Tất cả activity APIs (mood, journal, audio) đều tự động gọi streak log

**✅ Checkpoint Phase 2:**
Active user: viết journal ✓, check-in mood ✓, nghe audio ✓, streak tăng ✓.
Free user: bị block đúng chỗ, thấy upsell banner ✓.
Không còn hardcode hay mock data trong các trang này.

---

## Phase 3 — AI & Advanced Features (Ngày 9–12)

**Mục tiêu:** Chatbot hoạt động thật, mood test, breathing exercise, báo cáo auto-generate.

### Task 3.1 — AI Chatbot
- Install: `npm install openai`
- `POST /api/chat` → OpenAI streaming response
  - System prompt inject context: `onboarding_goal`, `mood_score`, `current_day/21`
  - Hard boundary: không tư vấn tâm lý, không chẩn đoán
  - Escalation: detect từ khóa nghiêm trọng → ấm áp + hiển thị hotline `1800 599 920`
- `GET /api/chat/history` → `chat_messages` theo ngày
- `GET /api/chat/usage` → check `chat_daily_usage` (free: max 3/ngày)
- Wire `/ai` page → real API (xóa mock conversation hoàn toàn)
- Disclaimer cố định trên UI chat
- Free tier: disable input sau 3 messages + show upgrade prompt
- Log activity: `type = 'chat'`

### Task 3.2 — Mood Test
- Build `/mood-test` page: 5–7 câu quiz trắc nghiệm
- `POST /api/mood-test` → lưu `answers` + tính `result_label` + `recommendations`
  ```
  Logic: map answers score → label (ví dụ: "Đang căng thẳng nhẹ")
  Recommendations: array audio category/track IDs phù hợp
  Ví dụ: stress cao → breathing 4-7-8, guided meditation buổi tối
  ```
- Hiển thị kết quả + gợi ý nội dung ngay sau khi submit
- Free tier: chỉ làm được 1 lần

### Task 3.3 — Breathing Exercise
- Build `/audio/breathing` page
- 3 kỹ thuật:

  | Kỹ thuật | Pattern | Dùng cho |
  |---|---|---|
  | 4-7-8 | Hít 4s → Giữ 7s → Thở 8s | Trước ngủ |
  | Box Breathing | Hít 4s → Giữ 4s → Thở 4s → Giữ 4s | Giảm lo âu |
  | Coherent | Hít 5s → Thở 5s | Cân bằng chung |

- Animation: Framer Motion vòng tròn pulse mở rộng/thu nhỏ
- Text phase thay đổi theo: **Hít vào / Giữ / Thở ra**
- Log activity: `type = 'breathing'`

### Task 3.4 — Meditation Timer
- Build `/audio/timer` page
- Chọn thời gian: 5 / 10 / 15 / 20 / 30 phút
- Chuông bắt đầu + kết thúc (audio file ngắn từ Supabase Storage)
- Ambient sound tùy chọn trong khi timer chạy
- Log activity: `type = 'timer'`

### Task 3.5 — Báo cáo Auto Generate
- `POST /api/reports/generate`:
  - **Weekly**: query 7 ngày → gọi OpenAI → insert `reports` với `type = 'weekly'`
  - **Full 21**: trigger khi `expires_at` reached → generate full journey report
- `GET /api/reports` → list reports của user
- `GET /api/reports/[id]` → chi tiết report
- Build `/reports` page: list + detail view
- Vercel Cron Job: mỗi Chủ Nhật 23:59 → POST `/api/reports/generate`
- Khi full 21 report sẵn sàng → in-app notification + email (Supabase email hoặc Resend)

**✅ Checkpoint Phase 3:**
Chatbot stream response thật, giới hạn free tier đúng, escalation hoạt động.
Breathing animation chạy đúng 3 kỹ thuật.
Báo cáo tuần được generate tự động vào Chủ Nhật.

---

## Phase 4 — Admin & Polish (Ngày 13–15)

**Mục tiêu:** Admin quản lý được orders. Edge cases hoạt động. Responsive ổn. Project sạch.

### Task 4.1 — Admin Panel Sub-pages
- `/admin/orders`:
  - List tất cả orders + filter theo status
  - `PATCH /api/admin/orders/[id]/status` → update enum + trigger in-app notification cho user
- `/admin/users`:
  - List users + subscription status + ngày bắt đầu/hết hạn + streak hiện tại
- `/admin/reports`:
  - List báo cáo đã generate
  - Nút trigger manual generate

### Task 4.2 — Edge Cases
- **Hết 21 ngày:** check `expires_at < now()` khi user load dashboard → auto set `expired`
- **Re-purchase flow:** user expired → shop → checkout → new order → 21 ngày mới chỉ start khi click "Bắt đầu"
- **Mua box khi box cũ chưa hết:** cho phép mua, nhưng subscription mới chỉ activate sau khi box hiện tại expired

### Task 4.3 — Responsive & UX Polish
- Kiểm tra mobile cho tất cả trang build trong Phase 2–3
- Loading states + skeleton cho tất cả API calls
- Error states rõ ràng (network error, auth expired)
- Empty states cho: journal trống, mood history chưa có data, audio library
- Build `/journey` page: calendar view 21 ngày với activity dots theo ngày

### Task 4.4 — Final Cleanup
- QR code trên box → `/` (landing page) → flow đăng ký mượt
- Kiểm tra end-to-end toàn bộ flow một lần
- Xóa: `src/next-app/` folder, seed code cũ, demo artifacts
- Cập nhật `product_spec.md`: ghi nhận MongoDB → Supabase, confirm final feature list
- Update `README.md` với hướng dẫn setup mới (Supabase thay MongoDB)

**✅ Checkpoint Phase 4:**
Flow hoàn chỉnh: QR → register → onboarding → mua box → 21 ngày → expired → mua lại.
Admin quản lý được orders end-to-end.
Responsive trên mobile ổn.

---

## Summary

| Phase | Nội dung | Ngày | Blocker nếu skip |
|---|---|---|---|
| Phase 0 | Supabase setup + migrate auth + xóa MongoDB | 1–2 | Block tất cả phase sau |
| Phase 1 | Subscription logic + PayOS + 21 ngày flow | 3–4 | Block tier gating, streak context |
| Phase 2 | Journal + Mood + Audio + Streak | 5–8 | Block AI context, Reports data |
| Phase 3 | AI Chatbot + Mood Test + Breathing + Reports | 9–12 | Block admin reports |
| Phase 4 | Admin + Edge cases + Polish | 13–15 | — |

---

## API Routes — Full List (Target State)

```
-- Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

-- Payment
POST /api/checkout/create-payment-link
POST /api/payos/webhook
GET  /api/payos/status/[orderId]

-- Orders & Subscription
GET  /api/orders
GET  /api/orders/[id]
GET  /api/subscriptions
POST /api/subscriptions/start

-- Mood
POST /api/mood
GET  /api/mood/history

-- Mood Test
POST /api/mood-test

-- Journal
GET  /api/journal
POST /api/journal
GET  /api/journal/[date]
PUT  /api/journal/[date]
GET  /api/journal/prompts

-- Audio
GET  /api/audio
GET  /api/audio/[id]/url

-- Chat
POST /api/chat
GET  /api/chat/history
GET  /api/chat/usage

-- Streak
GET  /api/streak
POST /api/streak/log

-- Reports
GET  /api/reports
GET  /api/reports/[id]
POST /api/reports/generate

-- Admin
GET   /api/admin/orders
PATCH /api/admin/orders/[id]/status
GET   /api/admin/users
GET   /api/admin/reports
POST  /api/admin/reports/generate

-- Seed
POST /api/seed
```