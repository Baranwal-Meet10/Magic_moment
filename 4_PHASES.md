# 🗺️ GiftLink — Phased Roadmap & Build Order

> This file tells you exactly **what to build first, second, third...** within each phase, and why that order matters (dependencies). Follow the numbered steps top to bottom — don't skip ahead.

---

## Phase 1 — MVP (Target: 1–2 weeks)
Goal: One person can create a gift and another person can open it, end to end.

**Build order:**

1. **Project scaffold** — `npx create-next-app`, add Tailwind, connect to a new Supabase project
   - *Why first: everything else needs a running app + a database to talk to.*
2. **`gifts` table** — create in Supabase with the core fields (see `2_ARCHITECTURE.md` §3): `id`, `slug`, `message`, `image_urls`, `open_policy`, `is_opened`, `created_at`
   - *Why: the form and the reveal page both need somewhere to read/write.*
3. **Slug generator + create API** — `/api/gifts/create` using `nanoid`, saves a row, returns the slug
   - *Why: build the "write" path before the "read/UI" path — easier to test with Postman/curl first.*
4. **Create-gift form (`/create`)** — message textarea + single image upload → calls the API from step 3
   - *Why: now you have a working create flow end-to-end.*
5. **Link result screen** — show the generated `giftlink.app/g/[slug]` link with a copy button
   - *Why: without this, a creator has no way to actually get the link.*
6. **Public reveal page (`/g/[slug]`)** — fetch gift by slug, show a simple "tap to open" → reveal message + image (a basic fade or simple confetti is enough for MVP; skip fancy effects for now)
   - *Why: this is the other half of the loop — now the whole create → share → open flow works.*
7. **One-time-open logic** — on open, flip `is_opened = true`; if already opened, show the "already opened" state instead
   - *Why: needs steps 2 & 6 done first, since it modifies the same row the reveal page reads.*
8. **Deploy to Vercel** — connect repo, add Supabase env vars, deploy
   - *Why last: deploy once the core loop actually works locally, so you're not debugging on prod.*

✅ **Phase 1 is done when:** you can create a gift on your phone, send yourself the link over WhatsApp, open it, and see it lock on a second visit.

**Pros of this order:** each step is testable on its own before moving to the next; you get a real working demo after step 6, even before polish.
**Cons/watch-outs:** no moderation or abuse protection yet — keep links private/shared only, don't publicize the site until Phase 2's report feature exists.

---

## Phase 2 — Personalization & Locks
Goal: Make gifts feel personal, add light security, and make the reveal actually fun.

**Build order:**

1. **Theme picker** — add `theme` field to form + `gifts` table; a few preset color/style themes
   - *Why first: effects and UI in later steps depend on knowing which theme is active.*
2. **Real reveal effects** — build 2–3 effect components (confetti, envelope, ribbon-unwrap) per `5_DESIGN.md`, register in an `effectsRegistry.ts`, wire theme → effect mapping
   - *Why: this is the single biggest "fun factor" upgrade — do it early in this phase.*
3. **Name-lock** — add `recipient_name` field to form + a name-check gate on the reveal page before the effect plays
   - *Why after effects: the gate sits in front of the reveal you just built, so build the reveal first.*
4. **PIN-lock** — same pattern as name-lock, optional extra field
5. **Multiple images (slideshow)** — extend `image_urls` to an array, update form (multi-upload) and reveal page (slideshow component)
6. **Expiry dates** — add `expires_at`; reveal page checks and shows an "expired" state (reuse the "already opened" pattern from Phase 1)
7. **OG image/meta tags** — add dynamic `<meta>` tags to `/g/[slug]` so shared links look good in WhatsApp/iMessage previews
   - *Why near the end: needs the theme/image work above to generate a meaningful preview image.*
8. **"Report this gift" link + moderation queue** — simple flag button + an admin-only table/page to review flags
   - *Why last: only worth doing once there's real (even if small) public traffic.*

✅ **Phase 2 is done when:** a gift feels genuinely delightful to open, has at least a basic lock option, and there's a way to report abuse.

**Pros:** big jump in fun/shareability with contained scope.
**Cons/watch-outs:** don't let the create-form balloon — keep it to ~60 seconds to fill out; make new fields optional, not required.

---

## Phase 3 — Accounts & Notifications
Goal: Let creators track what they've sent and know when it's opened.

**Build order:**

1. **Supabase Auth (optional login)** — email + Google login, but creating/sending a gift must still work without logging in
   - *Why first: everything else in this phase (dashboard, notifications) needs a `user_id` to attach to.*
2. **Link gifts to users** — add optional `user_id` to `gifts` table, set it when a logged-in user creates one
3. **"My sent gifts" dashboard (`/dashboard`)** — list a user's gifts with open/unopened status
   - *Why after step 2: needs the `user_id` link to query by.*
4. **`open_events` table + logging** — record each open (timestamp, hashed IP) when a gift is opened
   - *Why before notifications: you need the event to exist before you can notify on it.*
5. **"They opened it!" email notification** — trigger on first `open_events` insert (Supabase Function or simple webhook + email API like Resend)
6. **Basic analytics** — visits vs. actual opens, shown on the dashboard per gift

✅ **Phase 3 is done when:** a logged-in creator can see all gifts they've sent and get notified the moment one is opened.

**Pros:** sets up retention and the data needed for Phase 4 monetization.
**Cons/watch-outs:** keep auth fully optional — never gate the core create/send flow behind login.

---

## Phase 4 — Monetization & Growth
Goal: Add premium effects and a payment gateway, plus virality features.

**Build order:**

1. **Premium effects library** — build the higher-effort effects (fireworks, snowfall, custom video intro) as new entries in `effectsRegistry.ts`
   - *Why first: payments need something real to unlock — build the product before the paywall.*
2. **`payments` table** — add to Supabase per `2_ARCHITECTURE.md` §3
3. **Stripe (or Razorpay) Checkout integration** — `/api/payments/create-session` creates a hosted checkout session for a chosen premium effect/pack
4. **Webhook handler (`/api/payments/webhook`)** — verifies signature, marks `payments.status = success`, sets `gifts.is_premium = true`
   - *Why after step 3: the webhook is the trusted source of truth — never unlock premium from the client-side redirect alone.*
5. **Upsell UI in create-flow** — show premium effects with a "✨ Premium" badge + price, redirect to checkout when selected
   - *Why last in the payment chain: UI is the final connective layer once the backend can actually process a real payment.*
6. **Video/audio message support** — extend storage + reveal page to handle short clips
7. **Public gift wall / template gallery** — opt-in, anonymized showcase of past gifts for marketing/virality
8. **Downloadable QR codes** — `qrcode` package, generate on the link-result screen from Phase 1 step 5
9. **Mobile app wrapper** — only build if there's real demand signal from usage data (Expo/Capacitor)

✅ **Phase 4 is done when:** a creator can pay for a premium effect and it reliably unlocks, verified through the webhook — not the redirect.

**Pros:** real monetization path; QR/gallery features add organic growth.
**Cons/watch-outs:** payment integration is the highest-risk phase for bugs/security — follow the webhook-only-confirmation rule strictly (see `3_RULES.md` §6), and don't start this phase until Phases 1–3 are stable in production.

---

## Cross-Phase Reminders
- Update `5_DESIGN.md` whenever a new effect/theme is added
- Update `6_MEMORY.md` after every work session — mark what's done, what's in progress, what's next
- Re-check `3_RULES.md` "Definition of Done" before marking any step above complete
- Never start a phase's step out of order — most steps depend on the one before it existing first
