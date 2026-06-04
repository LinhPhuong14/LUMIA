# LUMIA Web

Production-oriented starter for the LUMIA wellness commerce + subscription platform.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 token-based design system
- MongoDB Atlas via Mongoose
- Session-cookie auth with `jose`
- PayOS server-side checkout + verified webhook flow
- Vercel-ready structure

## Core routes

- `/` landing page
- `/boxes` tier listing
- `/boxes/[slug]` product detail
- `/checkout` secure checkout
- `/activate` activation code flow
- `/dashboard` ritual hub
- `/subscription` subscription management
- `/journal`, `/audio`, `/ai` feature-ready shells
- `/admin` RBAC admin area

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/checkout/create-payment-link`
- `POST /api/payos/webhook`
- `POST /api/subscriptions/activate-code`
- `GET /api/me/subscription`
- `POST /api/me/profile`
- `GET /api/admin/*`
- `POST /api/seed`

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill MongoDB Atlas and PayOS secrets for real checkout.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

If MongoDB or PayOS is missing and `DEMO_MODE=true`, the app still renders and supports demo login/checkout behavior so the UX can be reviewed before infrastructure is connected.

## Seeding

Run:

```bash
curl -X POST http://localhost:3000/api/seed
```

This seeds:

- LUMIA products and subscription plans
- feature flags
- one sample activation code: `LUMIA-DEEP-3M-2026`
- one admin account: `admin@lumia.vn` / `Lum1aAdmin!`

Change the seeded password immediately outside local/demo environments.

## PayOS notes

- Payment links are created only on the server.
- `returnUrl` is UX-only.
- subscription grant happens after verified webhook receipt.
- order state is designed around `draft -> pending_payment -> paid/provisioning -> fulfilled`.
