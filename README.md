# LUMIA Web

Wellness web app — physical box + 21-day digital journey.

## Deploy lên Vercel (nhanh)

### 1. Push repo lên GitHub

```bash
git push origin main
```

### 2. Import project trên [vercel.com/new](https://vercel.com/new)

- Framework: **Next.js** (auto-detect)
- Build: `npm run build`
- Region: Singapore (`sin1`) — đã cấu hình trong `vercel.json`

### 3. Thêm Environment Variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Bắt buộc | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | `sb_publishable_...` — client (thay anon key) |
| `SUPABASE_SECRET_KEY` | ✅ | `sb_secret_...` — server-only (thay service_role) |
| `LLM_API_KEY` | ✅ | OpenAI API key (hoặc compatible endpoint) |
| `LLM_MODEL` | Tùy chọn | Mặc định `gpt-4o-mini` |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://your-app.vercel.app` |
| `CRON_SECRET` | ✅ | Random string — Vercel Cron dùng làm Bearer token |
| `PAYOS_*` | Khi bật shop | Webhook → `https://your-app.vercel.app/api/payos/webhook` |
| `SEED_SECRET` | Tùy chọn | Bảo vệ `POST /api/seed` trên production |

### 4. Supabase Auth redirect

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**`

### 5. Chạy migration DB

SQL Editor → paste `supabase/migrations/001_initial_schema.sql` → Run

### 6. Seed (lần đầu)

```bash
curl -X POST https://your-app.vercel.app/api/seed \
  -H "x-seed-secret: YOUR_SEED_SECRET"
```

### 7. Kiểm tra deploy

```bash
curl https://your-app.vercel.app/api/health
```

---

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres)
- PayOS checkout + webhook
- AI in-process (logic port từ `lumia_service_ai` — không cần server AI riêng)
- Vercel (region `sin1`)

## Local dev

```bash
cp .env.example .env.local
# DEMO_MODE=true  (mặc định khi không phải Vercel production)
npm install
npm run dev
```

## Core flows

1. Register → `/onboarding` → dashboard (free)
2. Shop → PayOS → webhook → subscription `active` (chưa `started_at`)
3. Admin: order → `delivered` → user **Bắt đầu hành trình 21 ngày**
4. 21 ngày → expired → mua lại
