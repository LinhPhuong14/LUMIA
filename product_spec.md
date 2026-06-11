# LUMIA — Product Specification v1.0

## Overview

LUMIA là một wellness web app được phân phối qua physical box. Người dùng mua box, quét QR trên card cảm ơn, tạo tài khoản, thanh toán, nhận box và bắt đầu hành trình 21 ngày tập trung vào giấc ngủ và thiền định.

---

## Project Context

| Thuộc tính | Chi tiết |
|---|---|
| Loại dự án | Pilot / Đồ án |
| Thời gian chạy | 3 tháng, sau đó stop |
| Số lượng user dự kiến | ~20 người |
| Scale requirement | Không cần scale |
| Maintain sau khi build | Không |
| Team | Outsource hoàn toàn |

---

## Tech Stack

| Layer | Tool | Lý do |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, routing, performance |
| Styling | Tailwind CSS + Shadcn/ui | Build nhanh, đẹp đủ dùng |
| Backend | Supabase | Auth + DB + Storage + Realtime trong 1 |
| AI Chatbot | OpenAI GPT-4o mini | Rẻ, đủ nhanh cho chat |
| Payment | PayOS | Theo yêu cầu client |
| Audio Storage | Supabase Storage | Đủ cho pilot |
| Deploy | Vercel | Free tier, CI/CD tự động |
| Animation | Framer Motion | Breathing exercise visual |

---

## System Architecture

```
┌─────────────────────────────────────────┐
│              Next.js 14                  │
│         (Frontend + API Routes)          │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│  Supabase   │  │  OpenAI     │
│  Auth + DB  │  │  GPT-4o mini│
│  Storage    │  └─────────────┘
└──────┬──────┘
       │
┌──────▼──────┐
│    PayOS    │
│  (Webhook)  │
└─────────────┘
```

---

## User Roles & Access Control

### Roles

| Role | Mô tả |
|---|---|
| `guest` | Chưa đăng ký — chỉ xem landing page |
| `user` | Đã đăng ký — free tier hoặc active |
| `admin` | Quản trị hệ thống — full access + admin panel |

### Subscription States

| State | Điều kiện | Access |
|---|---|---|
| `free` | Có account, chưa mua box hoặc đã hết hạn | Giới hạn (xem bảng bên dưới) |
| `active` | Đã mua box, đã click bắt đầu, còn trong 21 ngày | Full access |
| `expired` | Hết 21 ngày, chưa mua lại | Về free tier |

### Feature Access Matrix

| Tính năng | Free Tier | Active Tier |
|---|---|---|
| Landing page | ✅ | ✅ |
| Đăng ký / Đăng nhập | ✅ | ✅ |
| Shop (xem + mua box) | ✅ | ✅ |
| Xem journal cũ (read-only) | ✅ | ✅ |
| Mood check-in | ✅ | ✅ |
| Mood test | 1 lần | Không giới hạn |
| AI Chatbot | 3 lần/ngày | Không giới hạn |
| Tạo journal mới | ❌ | ✅ |
| Audio — 2-3 track mẫu cố định | ✅ | ✅ |
| Audio — full collection | ❌ | ✅ |
| Streak + Badges | ❌ | ✅ |
| Báo cáo tuần + 21 ngày | ❌ | ✅ |
| Breathing exercise | ❌ | ✅ |
| Meditation timer | ❌ | ✅ |

---

## Core User Flows

### Flow 1 — Onboarding

```
Landing page
→ Đăng ký (email + password)
→ Onboarding quiz (3 câu — chọn goal: ngủ tốt hơn / giảm stress / tập thiền)
→ Dashboard (free tier)
→ Banner: "Mua box để mở khóa toàn bộ tính năng"
```

### Flow 2 — Purchase & Unlock

```
Shop page
→ Chọn box → Checkout
→ PayOS payment page
→ PayOS webhook → server confirm thanh toán
→ Auto: tạo order (status: paid)
         + set subscription (status: active, chưa started_at)
→ User thấy: "Đơn hàng đã xác nhận, đang chuẩn bị giao"
→ Admin cập nhật trạng thái: paid → preparing → shipping → delivered
→ Khi delivered: nút "Bắt đầu hành trình 21 ngày" xuất hiện trên dashboard
→ User click → started_at = now(), expires_at = now() + 21 ngày
→ Full access unlock ngay lập tức
```

### Flow 3 — Daily Usage (Active User)

```
Dashboard
→ Mood check-in hàng ngày
→ Chọn activity: Journal / Audio / Chat / Breathing / Meditation
→ Hoàn thành ít nhất 1 activity → streak +1
→ Progress bar 21 ngày cập nhật
```

### Flow 4 — Expired → Re-purchase

```
Hết 21 ngày
→ Subscription status → expired → về free tier
→ Dashboard hiển thị: recap 21 ngày + prompt mua box mới
→ Journal cũ vẫn đọc được
→ Vào shop mua box mới → lặp lại Flow 2
→ 21 ngày mới bắt đầu khi user click "Bắt đầu" lần tiếp theo
```

### Flow 5 — Báo cáo Auto Generate

```
Cuối mỗi tuần (cron job):
→ Query mood_checkins + activity_logs + journal_entries (7 ngày gần nhất)
→ Gửi data lên OpenAI API
→ Generate text insight
→ Lưu vào bảng reports
→ Hiển thị trong tab Báo cáo

Khi expires_at reached (ngày 21):
→ Query toàn bộ 21 ngày
→ Generate full journey report
→ Hiển thị in-app notification + gửi email
```

---

## Database Schema

```sql
-- ============================================
-- USERS & AUTH (Supabase Auth built-in)
-- ============================================

profiles
  id              uuid PRIMARY KEY references auth.users
  email           text
  full_name       text
  avatar_url      text
  role            enum('user', 'admin') DEFAULT 'user'
  onboarding_goal enum('sleep', 'stress', 'meditation')
  created_at      timestamptz DEFAULT now()

-- ============================================
-- SUBSCRIPTION & BOX
-- ============================================

subscriptions
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  status          enum('free', 'active', 'expired') DEFAULT 'free'
  started_at      timestamptz  -- null cho đến khi user click "Bắt đầu"
  expires_at      timestamptz  -- started_at + 21 ngày
  box_order_id    uuid references orders

orders
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  status          enum('paid', 'preparing', 'shipping', 'delivered')
  payos_order_id  text UNIQUE
  amount          integer  -- VND
  created_at      timestamptz DEFAULT now()

-- ============================================
-- CORE FEATURES
-- ============================================

journal_entries
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  content         text
  prompt_used     text
  date            date
  created_at      timestamptz DEFAULT now()

mood_checkins
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  score           integer CHECK (score >= 1 AND score <= 5)
  note            text
  date            date
  created_at      timestamptz DEFAULT now()

mood_test_results
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  answers         jsonb
  result_label    text
  recommendations jsonb  -- array of audio track IDs or categories
  created_at      timestamptz DEFAULT now()

-- ============================================
-- AI CHAT
-- ============================================

chat_sessions
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  created_at      timestamptz DEFAULT now()

chat_messages
  id              uuid PRIMARY KEY
  session_id      uuid references chat_sessions
  user_id         uuid references profiles
  role            enum('user', 'assistant')
  content         text
  created_at      timestamptz DEFAULT now()

chat_daily_usage
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  date            date
  count           integer DEFAULT 0  -- free tier: max 3/ngày

-- ============================================
-- AUDIO LIBRARY
-- ============================================

audio_tracks
  id              uuid PRIMARY KEY
  title           text
  description     text
  category        enum(
                    'sleep_sound',
                    'sleep_cast',
                    'wind_down',
                    'sleep_music',
                    'guided_meditation',
                    'breathing',
                    'timer_ambient',
                    'mini_meditation'
                  )
  duration_seconds integer
  file_url        text
  thumbnail_url   text
  is_free         boolean DEFAULT false
  sort_order      integer
  created_at      timestamptz DEFAULT now()

-- ============================================
-- ACTIVITY & STREAK
-- ============================================

activity_logs
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  activity_type   enum('mood', 'journal', 'audio', 'chat', 'breathing', 'timer')
  date            date
  created_at      timestamptz DEFAULT now()

streaks
  id              uuid PRIMARY KEY
  user_id         uuid references profiles UNIQUE
  current_streak  integer DEFAULT 0
  longest_streak  integer DEFAULT 0
  last_active_date date

-- ============================================
-- REPORTS
-- ============================================

reports
  id              uuid PRIMARY KEY
  user_id         uuid references profiles
  type            enum('weekly', 'full_21')
  content         jsonb  -- AI generated insight
  period_start    date
  period_end      date
  created_at      timestamptz DEFAULT now()
```

---

## API Routes (Next.js App Router)

```
/api/auth/*                    Supabase Auth handlers

/api/payos/create              POST — Tạo payment link PayOS
/api/payos/webhook             POST — Nhận callback từ PayOS (verify + unlock)
/api/payos/status/[orderId]    GET  — Check trạng thái đơn hàng

/api/orders                    GET  — Lấy orders của user hiện tại
/api/orders/[id]               GET  — Chi tiết đơn hàng
/api/subscriptions             GET  — Lấy subscription status
/api/subscriptions/start       POST — User click "Bắt đầu" → set started_at

/api/chat                      POST — Stream response từ OpenAI
/api/chat/history              GET  — Lịch sử chat theo ngày
/api/chat/usage                GET  — Check số lần chat còn lại hôm nay

/api/mood                      GET, POST — Mood check-in
/api/mood/history              GET  — Mood history (filter by week/month)
/api/mood-test                 POST — Submit quiz + trả về kết quả + recommendations

/api/journal                   GET, POST — Journal entries
/api/journal/[date]            GET, PUT, DELETE — Journal theo ngày
/api/journal/prompts           GET  — Lấy prompt gợi ý ngẫu nhiên

/api/audio                     GET  — List tracks (filtered by tier + category)
/api/audio/[id]/url            GET  — Get signed URL từ Supabase Storage

/api/streak                    GET  — Lấy streak hiện tại
/api/streak/log                POST — Log activity + cập nhật streak

/api/reports                   GET  — Danh sách reports
/api/reports/[id]              GET  — Chi tiết report
/api/reports/generate          POST — Trigger generate (cron hoặc admin)

-- Admin (role: admin required)
/api/admin/orders              GET       — List tất cả orders
/api/admin/orders/[id]/status  PATCH     — Cập nhật trạng thái đơn
/api/admin/users               GET       — List users + subscription status
/api/admin/reports/generate    POST      — Manually trigger report generation
```

---

## Page Structure (Frontend)

```
/ ................................. Landing page
/login ............................ Đăng nhập
/register ......................... Đăng ký
/onboarding ....................... Quiz chọn goal (sau đăng ký)

/dashboard ........................ Home — streak, progress 21 ngày, quick actions
/journey .......................... 21-day progress calendar view

/mood ............................. Check-in hôm nay + mood history chart
/mood-test ........................ Quiz 5-7 câu + kết quả + gợi ý

/journal .......................... Danh sách journal entries
/journal/[date] ................... Editor / view theo ngày

/audio ............................ Library tổng hợp
/audio/sleep ...................... Sleep sounds, sleep cast, wind down, sleep music
/audio/meditation ................. Guided, mini, breathing, timer
/audio/[id] ....................... Audio player page

/chat ............................. AI Chatbot

/reports .......................... Danh sách báo cáo
/reports/[id] ..................... Chi tiết báo cáo (weekly / full 21 ngày)

/shop ............................. Trang mua box
/shop/checkout .................... Checkout + redirect PayOS
/shop/order/[id] .................. Trạng thái đơn hàng

/profile .......................... Thông tin cá nhân
/settings ......................... Cài đặt

/admin ............................ Admin dashboard
/admin/orders ..................... Quản lý đơn hàng
/admin/users ...................... Quản lý users
/admin/reports .................... Xem báo cáo đã generate
```

---

## Feature Specifications

### 1. Auth & Onboarding

- Đăng ký / Đăng nhập bằng email + password (Supabase Auth)
- Onboarding quiz sau đăng ký: 3 câu, chọn goal (ngủ tốt hơn / giảm stress / tập thiền)
- Goal được lưu vào `profiles.onboarding_goal` và dùng để personalize gợi ý + AI context

---

### 2. Shop & Payment (PayOS)

- Trang shop hiển thị box: ảnh, mô tả, giá
- Checkout tích hợp PayOS — redirect sang PayOS payment page
- PayOS webhook xử lý sau khi thanh toán:
  - Verify signature
  - Tạo order với status `paid`
  - Set subscription status `active` (chưa set `started_at`)
- Trạng thái đơn hàng hiển thị cho user: `paid → preparing → shipping → delivered`
- Admin cập nhật trạng thái thủ công qua admin panel
- Khi order status = `delivered` → nút **"Bắt đầu hành trình 21 ngày"** xuất hiện
- User click bắt đầu → `started_at = now()`, `expires_at = now() + 21 days`
- Có thể mua box mới khi box cũ chưa hết — 21 ngày mới chạy độc lập

---

### 3. AI Chatbot

**Persona:** Người bạn đồng hành — ấm áp, lắng nghe, không phán xét

**Scope được phép:**
- Lắng nghe và phản hồi cảm xúc nhẹ
- Gợi ý bài thiền, kỹ thuật hít thở
- Nói chuyện về giấc ngủ
- Tạo không gian an toàn để xả cảm xúc

**Scope KHÔNG được phép:**
- Chẩn đoán tâm lý
- Tư vấn y tế
- Đưa ra lời khuyên chuyên sâu về sức khỏe tâm thần

**Escalation logic:**
- Detect từ khóa nghiêm trọng trong tin nhắn user
- Phản hồi nhẹ nhàng + hiển thị: *"Mình nghĩ bạn xứng đáng được hỗ trợ tốt hơn mình có thể cung cấp. Đường dây hỗ trợ tâm lý: 1800 599 920 (miễn phí, 24/7)"*

**Disclaimer cố định trên UI:**
> LUMIA Chatbot là người bạn đồng hành cho giấc ngủ và thiền định, không phải công cụ tư vấn tâm lý chuyên nghiệp.

**System prompt structure:**

```
ROLE:
Bạn là người bạn đồng hành của LUMIA — ấm áp, lắng nghe, không phán xét.
Bạn giúp người dùng cải thiện giấc ngủ và thực hành thiền định.

SCOPE:
- Được: lắng nghe cảm xúc nhẹ, gợi ý bài thiền, hướng dẫn hơi thở,
  nói về giấc ngủ, tạo không gian an toàn để xả cảm xúc
- Không được: chẩn đoán, tư vấn tâm lý chuyên sâu, đưa ra lời khuyên y tế

ESCALATION:
Nếu phát hiện từ khóa nghiêm trọng (tự làm hại, tuyệt vọng, không muốn sống...)
→ Phản hồi ấm áp + đề xuất: "Đường dây hỗ trợ: 1800 599 920"

CONTEXT:
- User goal: {onboarding_goal}
- Mood hôm nay: {mood_score}/5
- Ngày thứ: {current_day}/21 trong hành trình
```

**Giới hạn:**
- Free tier: 3 tin nhắn/ngày (track qua `chat_daily_usage`)
- Active tier: không giới hạn
- Lưu lịch sử chat trong `chat_messages`

---

### 4. Mood Check-in & Mood Test

**Mood Check-in:**
- 1 lần/ngày
- Chọn mood qua emoji scale 1-5
- Optional: thêm note ngắn
- Hiển thị mood history dạng chart theo tuần/tháng

**Mood Test:**
- 5-7 câu hỏi trắc nghiệm
- Kết quả: label (ví dụ: "Đang căng thẳng nhẹ") + gợi ý nội dung phù hợp
- Ví dụ logic: score stress cao → gợi ý breathing exercise 4-7-8
- Free tier: 1 lần | Active tier: không giới hạn

---

### 5. Journal

- Viết tự do theo ngày
- Prompt gợi ý xoay vòng nếu không biết viết gì
- Free tier: chỉ đọc lại journal cũ (read-only), không tạo mới
- Active tier: tạo mới không giới hạn
- Scroll lại theo ngày, lưu trữ lâu dài

---

### 6. Audio Library — Sleep (Nhóm 1)

| Category | Mô tả | Free |
|---|---|---|
| Sleep Sounds | Tiếng ồn trắng, mưa, sóng biển, rừng, fire crackling — phát loop | 2-3 track |
| Sleep Cast | Audio dài 30-45 phút, câu chuyện ru ngủ, giọng đọc nhẹ | ❌ |
| Wind Down Routine | Chuỗi 3 bước trước ngủ: breathing → body scan → sleep sound | ❌ |
| Sleep Music | Nhạc ambient không lời | 1 track |

---

### 7. Audio Library — Meditation (Nhóm 2)

| Category | Mô tả | Free |
|---|---|---|
| Guided Meditation | Theo chủ đề: buổi sáng, lo âu nhẹ, tập trung, biết ơn, body scan | 1-2 track |
| Breathing Exercises | Hướng dẫn hít thở có visual animation (4-7-8, Box, Coherent) | ❌ |
| Meditation Timer | Tự thiền — chọn thời gian, chuông bắt đầu/kết thúc, ambient tùy chọn | ❌ |
| Mini Meditations | Các bài 1-3 phút cho người bận | ❌ |

---

### 8. Breathing Exercise — Visual Spec

3 kỹ thuật, mỗi kỹ thuật có animation vòng tròn pulse (Framer Motion):

| Kỹ thuật | Pattern | Dùng cho |
|---|---|---|
| 4-7-8 | Hít 4s → Giữ 7s → Thở 8s | Trước ngủ |
| Box Breathing | Hít 4s → Giữ 4s → Thở 4s → Giữ 4s | Giảm lo âu |
| Coherent Breathing | Hít 5s → Thở 5s | Cân bằng chung |

Text hướng dẫn thay đổi theo từng phase. Animation: CSS hoặc Framer Motion, không dùng library nặng.

---

### 9. Streak & Gamification

- Streak tăng khi hoàn thành ít nhất 1 activity trong ngày
- Activity được tính: mood check-in, nghe audio, viết journal, chat AI, breathing exercise
- Badge milestone: Ngày 7 / Ngày 14 / Ngày 21
- Progress bar 21 ngày hiển thị trên dashboard
- Streak reset về 0 nếu bỏ 1 ngày

---

### 10. Báo cáo Cá nhân (Auto Generate)

**Báo cáo tuần (weekly):**
- Trigger: cron job cuối mỗi tuần
- Data: mood trend, activities, streak, top audio đã nghe
- Output: text insight do AI generate
- Ví dụ: "Tuần này bạn check-in mood 5/7 ngày. Mood trung bình: 3.4/5. Bạn hay thiền vào buổi tối."

**Báo cáo 21 ngày (full journey):**
- Trigger: khi `expires_at` reached
- Data: toàn bộ 21 ngày
- Output: tổng kết hành trình — mood journey chart, top activities, insights cá nhân
- Notification in-app + email khi báo cáo sẵn sàng

---

### 11. Admin Panel

**Trang /admin/orders:**
- Danh sách tất cả orders
- Filter theo status
- Cập nhật trạng thái: `paid → preparing → shipping → delivered`

**Trang /admin/users:**
- Danh sách users
- Xem subscription status + ngày bắt đầu/hết hạn
- Xem số ngày streak hiện tại

**Trang /admin/reports:**
- Xem báo cáo đã generate
- Nút manually trigger generate nếu cần

---

## Build Priority

### Sprint 1 — Foundation
- Supabase setup (Auth, DB schema, Storage)
- Next.js project setup + Tailwind + Shadcn
- Auth pages (login, register)
- Onboarding quiz
- PayOS integration (create payment + webhook)
- Order flow + subscription logic
- Dashboard skeleton

### Sprint 2 — Core Features
- Journal (create, read, list)
- Mood check-in + history chart
- Audio player + library pages
- Streak logic + activity logging
- Free/active tier gating (middleware)

### Sprint 3 — AI & Advanced Features
- AI Chatbot (OpenAI stream + daily usage limit)
- Mood test (quiz + result + recommendations)
- Breathing exercise (animation + 3 kỹ thuật)
- Báo cáo auto generate (weekly cron + full 21 ngày)

### Sprint 4 — Polish & Admin
- Admin panel (orders, users, reports)
- Báo cáo 21 ngày UI
- Edge cases (box expired flow, re-purchase)
- Responsive design check
- QR landing page

---

## Risks & Constraints

| Risk | Mức độ | Mitigation |
|---|---|---|
| AI chatbot nhận nội dung nặng hơn scope | Cao | Hard boundary trong system prompt + escalation + disclaimer UI |
| PayOS webhook fail | Trung bình | Log webhook + manual fallback qua admin panel |
| Audio file size lớn | Thấp | Supabase Storage + signed URL, không embed trực tiếp |
| Scope creep từ "tham khảo Headspace" | Cao | Feature list đã lock — chỉ nhóm Sleep + Meditation |
| 21 ngày bắt đầu sai thời điểm | Thấp | User tự click bắt đầu sau khi nhận box |

---

## Notes

- Mỗi box không có QR code riêng — tất cả dùng chung 1 QR dẫn đến landing page
- Verification mua box được handle qua PayOS payment — không dùng access code
- Target user giả định: nữ 22-35, tự chăm sóc bản thân hoặc nhận gift (chưa được client confirm)
- Sản phẩm chỉ chạy 3 tháng — không cần optimize cho long-term maintenance