# 🏗️ GiftLink — Architecture

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | SSR for link previews, file-based routing per gift |
| Styling | Tailwind CSS | Fast, consistent utility styling |
| Animation | Framer Motion + Lottie | Unwrap/reveal effects |
| Sound (future) | Howler.js | Background music/sound on open |
| Backend | Next.js API routes | Keep single repo for MVP |
| Database | PostgreSQL via Supabase | Free tier, built-in Auth + Storage |
| File storage | Supabase Storage (or Cloudinary) | Images/video, not stored in DB |
| Auth (Phase 3+) | Supabase Auth | Email/Google login |
| Payments (Phase 4) | Stripe (or Razorpay for India-first) | Handles premium unlocks, PCI compliance |
| Hosting | Vercel | Zero-config deploy, free tier |
| Link IDs | nanoid | Short, unique, URL-safe slugs |
| QR codes (future) | `qrcode` npm package | Printable gift links |

## 2. High-Level Flow

```
Creator                         Recipient
   |                                |
   | 1. Fill form (text/image)      |
   | 2. Choose open policy          |
   | 3. (Phase 4) Pick premium fx?  |
   | 4. (Phase 4) Pay if premium    |
   | 5. Generate unique link ------>|
   | 6. Share link                  |
   |                                | 7. Opens link
   |                                | 8. (Optional) name/PIN check
   |                                | 9. Unwrap animation 🎉
   |                                | 10. Reveal message + image
   |<---- (Phase 3) "opened!" notif |
```

## 3. Data Model

### `gifts`
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | internal |
| slug | string (unique) | public link ID |
| creator_name | string, nullable | shown as "From: ___" |
| recipient_name | string, nullable | used for name_locked policy |
| message | text | gift words |
| image_urls | text[] | Supabase Storage URLs |
| video_url | string, nullable | Phase 4 |
| theme | enum | birthday / love / thanks / holiday / custom |
| effect_type | enum | confetti / ribbon-unwrap / envelope / premium-* |
| open_policy | enum | anyone_with_link / name_locked / one_time_only |
| pin_code | string, nullable | optional extra lock |
| is_opened | boolean | flips true after first open |
| opened_at | timestamp, nullable | |
| expires_at | timestamp, nullable | |
| is_premium | boolean | Phase 4 — paid effect/theme used |
| payment_id | string, nullable | Stripe/Razorpay charge ref |
| created_at | timestamp | |

### `open_events` (Phase 3+)
| Field | Type |
|---|---|
| id | UUID |
| gift_id | FK → gifts.id |
| opened_at | timestamp |
| opener_ip_hash | string, nullable |

### `users` (Phase 3+)
| Field | Type |
|---|---|
| id | UUID |
| email | string |
| created_at | timestamp |

### `payments` (Phase 4)
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| gift_id | FK → gifts.id | |
| user_id | FK → users.id, nullable | nullable if anonymous checkout |
| amount | integer | in cents/paise |
| currency | string | |
| provider | enum | stripe / razorpay |
| provider_ref | string | external charge/session ID |
| status | enum | pending / success / failed / refunded |
| created_at | timestamp | |

## 4. "Only They Can Open It" — Security Design
1. **Unguessable slug** (default): nanoid, 10–12 chars, high entropy
2. **Name-lock**: recipient types a name set by creator (casual gate)
3. **PIN-lock**: optional 4–6 digit code shared separately
4. **One-time open**: `is_opened` flips true after first successful view
5. **Expiry**: gift auto-locks after N days if unopened

This is intentionally "fun-app" security, not bank-grade — the goal is casual privacy, not cryptographic guarantees.

## 5. Route Structure

```
/                      → Landing page
/create                → Gift creation form
/create/preview        → Preview before link generation
/create/checkout       → (Phase 4) Payment for premium effects
/g/[slug]              → Public unwrap page
/g/[slug]/opened       → "Already opened" state
/dashboard             → (Phase 3) Creator's sent gifts
/api/gifts             → CRUD endpoints
/api/payments/webhook  → (Phase 4) Stripe/Razorpay webhook handler
```

## 6. Payment Gateway Integration (Phase 4 detail)

**Provider choice:**
- Stripe → best for global cards, simplest Next.js integration (`@stripe/stripe-js` + Stripe Checkout)
- Razorpay → better for India-first UPI/wallets audience

**Flow:**
1. Creator picks a premium theme/effect or add-on (music pack, no-branding, extra storage)
2. Frontend calls `/api/payments/create-session` → creates a Stripe Checkout Session (or Razorpay Order)
3. Redirect creator to hosted checkout page
4. On success, provider redirects back + sends a webhook to `/api/payments/webhook`
5. Webhook handler verifies signature, marks `payments.status = success`, sets `gifts.is_premium = true`
6. Only after confirmed webhook (not just redirect) does the gift unlock the premium feature — never trust client-side "payment succeeded" alone

**Security notes:**
- Never store card details — always use hosted checkout (Stripe/Razorpay handles PCI compliance)
- Always verify webhook signatures
- Use idempotency keys to avoid double-charging on retries

## 7. Future Effects System (Reveal Animations)

Design this as a pluggable `effect_type` so new ones can be added without touching core logic:

| Effect | Tier | Description |
|---|---|---|
| `confetti` | Free | Confetti burst on reveal (canvas-confetti lib) |
| `envelope` | Free | Envelope opens, letter slides out |
| `ribbon-unwrap` | Free | Box + ribbon peel-away animation |
| `fireworks` | Premium | Fireworks + sound |
| `snowfall` | Premium | Ambient snow + chime sound (holiday theme) |
| `custom-video-intro` | Premium | Short branded video plays before reveal |

Each effect = a self-contained component (`/components/effects/ConfettiEffect.tsx`, etc.) registered in an `effectsRegistry.ts` map, so adding a new one is additive, not a rewrite.

## 8. Hosting/Infra Notes
- Vercel free tier covers frontend + API routes for MVP traffic
- Supabase free tier: 500MB DB + 1GB storage — enough for MVP; monitor image sizes
- Add basic rate-limiting on `/api/gifts` creation endpoint to prevent spam/abuse
