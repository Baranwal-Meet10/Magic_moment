# 🗺️ GiftLink — Phased Roadmap & Build Order

> Follow this roadmap step by step. Each phase is ordered so dependencies are ready before you build the next feature.

---

## Phase 1 — MVP (Target: 1–2 weeks)
Goal: one person can create a gift and another person can open it, end to end.

Build order:
1. Project scaffold
   - `npx create-next-app`, add Tailwind, connect to a new Supabase project.
   - Why: everything else needs a working app and a database.
2. `gifts` table
   - Create the core Supabase table with fields: `id`, `slug`, `message`, `image_urls`, `open_policy`, `is_opened`, `created_at`.
   - Why: the create form and reveal page need a place to read/write gift data.
3. Slug generator + create API
   - Build `/api/gifts/create` using `nanoid`; save the gift row and return the slug.
   - Why: implement the write path before the UI so you can test the API first.
4. Create-gift form (`/create`)
   - Add message input and single image upload, then call the create API.
   - Why: this completes the creator flow end to end.
5. Link result screen
   - Show the generated `giftlink.app/g/[slug]` link with a copy button.
   - Why: creators need the link to share the gift.
6. Public reveal page (`/g/[slug]`)
   - Fetch the gift by slug, show a tap-to-open interaction, then reveal the message and image.
   - Why: this completes the share-and-open flow.
7. One-time-open logic
   - When opened, set `is_opened = true`; if already opened, show the locked state.
   - Why: it depends on the existing gift row and reveal page.
8. Deploy to Vercel
   - Connect the repo, add Supabase env vars, and deploy.
   - Why: deploy only after the core flow works locally.

Phase 1 done when:
- a gift can be created on a phone,
- the link can be shared,
- the gift can be opened,
- and it remains locked on a second visit.

Notes:
- Pros: each step is testable, and a working demo exists by step 6.
- Watch out: no moderation or abuse protection yet. Keep links private until Phase 2 adds reporting.

---

## Phase 2 — Personalization & Locks
Goal: make gifts feel personal, add high security, and improve the reveal experience.

Build order:
1. Theme picker
   - Add `theme` to the form and `gifts` table with preset color/style options.
   - Why: later UI and effects depend on the selected theme.
2. Reveal effects
   - Build 2–3 effect components such as confetti, envelope open, or ribbon unwrap. Register them in `effectsRegistry.ts` and map themes to effects.
   - Why: this is the biggest fun upgrade in this phase.
3. Name-lock
   - Add `recipient_name` to the form and require the correct name before revealing the gift.
   - Why: the gate belongs in front of the reveal, so build the reveal experience first.
4. PIN-lock
   - Add optional PIN protection with a similar gate flow.
5. Multiple images (slideshow)
   - Change `image_urls` to an array, update multi-upload in the form, and show a slideshow on the reveal page.
6. Expiry dates
   - Add `expires_at`; display an expired state on the reveal page when needed.
7. OG metadata
   - Add dynamic `<meta>` tags for `/g/[slug]` so shared links show proper previews in WhatsApp/iMessage.
   - Why: do this after theme and image work is available.
8. Report abuse flow
   - Add a "Report this gift" button and an admin moderation queue.
   - Why: only add this once there is real usage.

Phase 2 done when:
- gifts feel delightful,
- at least one lock option exists,
- and abuse can be reported.

Notes:
- Pros: boosts shareability while staying focused.
- Watch out: keep the create form easy to complete. Make new fields optional.

---

## Phase 3 — Accounts & Notifications    
<!-- i think this is for future purpose  -->
Goal: let creators track sent gifts and receive open notifications.

Build order:
1. Supabase Auth (optional login)
   - Add email and Google login, but keep gift creation open to anonymous users.
   - Why: dashboard and notifications need a `user_id`.
2. Link gifts to users
   - Add optional `user_id` to `gifts` and assign it for logged-in creators.
3. Sent gifts dashboard (`/dashboard`)
   - Show a user's gifts with open/unopened status.
   - Why: needs the `user_id` link.
4. `open_events` table + logging
   - Record each open event with timestamp and hashed IP.
   - Why: notifications need logged open events.
5. Open notification email
   - Send a "They opened it!" email when the first open event is recorded.
6. Basic analytics
   - Show visits versus opens on the dashboard.

Phase 3 done when:
- logged-in creators can see their sent gifts,
- and they receive notifications when gifts are opened.

Notes:
- Pros: builds retention and support for future monetization.
- Watch out: keep auth optional and never gate the core gift flow.

---

## Phase 4 — Monetization & Growth
Goal: add premium unlocks, payment support, and viral growth features.

Build order:
1. Premium effects library
   - Build higher-effort premium effects (fireworks, snowfall, custom video intro) in `effectsRegistry.ts`.
   - Why: create premium content before adding a paywall.
2. `payments` table
   - Add a payments table in Supabase.
3. Checkout integration
   - Build `/api/payments/create-session` for Stripe or Razorpay.
4. Payment webhook handler
   - Verify payment signatures, mark `payments.status = success`, and set `gifts.is_premium = true`.
   - Why: webhook confirmation must be the source of truth.
5. Premium upsell UI
   - Show premium effects with badges and prices in the create flow.
   - Why: UI should come after backend payment support exists.
6. Video/audio messages
   - Support short clips in storage and on the reveal page.
7. Public gift wall / template gallery
   - Add an opt-in, anonymized showcase for marketing.
8. QR code downloads
   - Generate shareable QR codes on the link result screen.
9. Mobile app wrapper
   - Only build this if usage data shows real demand.

Phase 4 done when:
- premium payments are processed reliably,
- unlocks are confirmed by webhook,
- and creators can purchase premium reveal content.

Notes:
- Pros: enables monetization and organic growth.
- Watch out: payment integration is high-risk. Follow webhook-only confirmation rules.

---

## Cross-Phase Reminders
- Update `6_MEMORY.md` after every work session.
- Review `3_RULES.md` "Definition of Done" before marking a step complete.
- Keep phase order. Most steps depend on the previous one.
