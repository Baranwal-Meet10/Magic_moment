# 📋 GiftLink — Project Requirements

## 1. Project Summary
GiftLink is a fun web app where anyone can create a digital "gift" (message + image, later video/audio) and share it via a unique private link. Only the person with the link (optionally verified by name/PIN) can open and view it — with a satisfying "unwrap" animation.

## 2. Goals
- Make sending a small digital surprise fun and emotional, not just a plain message
- Keep it fast, free-to-start, and easy to share via any messaging app
- Build a base that can later support premium features + payments

## 3. Target Users
- Friends/couples sending small surprises (birthdays, anniversaries, thank-yous)
- People who want a fun alternative to a plain text/WhatsApp message
- Casual, non-business users — this is NOT an enterprise/corporate tool

## 4. Functional Requirements

### 4.1 MVP (must-have)
- [ ] User can create a gift: enter message text + upload 1 image
- [ ] User selects an "open policy": anyone-with-link / name-locked / one-time-only
- [ ] System generates a unique short link (e.g. `giftlink.app/g/aX9kLp`)
- [ ] Recipient opens link → sees unwrap animation → reveals message + image
- [ ] If one-time-only, gift locks after first open ("already opened" screen)
- [ ] Fully anonymous — no login required for MVP

### 4.2 Phase 2 (should-have)
- [ ] Name-lock: recipient must type matching name to open
- [ ] PIN-lock: optional 4–6 digit code
- [ ] Multiple images (mini slideshow)
- [ ] Theme picker (birthday, love, thank-you, holiday, etc.)
- [ ] Expiry date for gifts
- [ ] Shareable link preview (OG image/title) for WhatsApp/iMessage

### 4.3 Phase 3 (nice-to-have)
- [ ] Creator accounts (optional login via email/Google)
- [ ] "My sent gifts" dashboard
- [ ] "They opened it!" notification (email) to sender
- [ ] Basic analytics: link visits vs. actual opens

### 4.4 Phase 4 (future / monetization)
- [ ] Video/audio message support
- [ ] Premium animated effects & themes (paid unlock)
- [ ] Payment gateway integration (Stripe / Razorpay) for:
  - Premium unwrap animations/effects
  - Extra storage (more images/longer videos)
  - "Add background music" packs
  - Removing "Made with GiftLink" branding
- [ ] Public gift wall / template gallery (opt-in, anonymized)
- [ ] Downloadable QR code for printed gifts
- [ ] Mobile app wrapper (Expo/Capacitor)

## 5. Non-Functional Requirements
- **Performance**: gift page should load in <2s on 4G
- **Availability**: hosted on managed infra (Vercel + Supabase) — no custom server maintenance for MVP
- **Privacy**: no public listing of private gifts by default; images/messages not indexed by search engines
- **Moderation**: basic report/flag mechanism for inappropriate content (Phase 2+)
- **Scalability**: schema and storage should support moving from free tier to paid tier without redesign
- **Accessibility**: reveal animations must have a "skip animation" option for accessibility/impatience

## 6. Out of Scope (for now)
- Real-time chat between sender/recipient
- Enterprise/team accounts
- Native mobile apps (until Phase 4+)
- Multi-language support (until there's real demand)

## 7. Success Metrics (early)
- # of gifts created per week
- % of created gifts that get opened
- Link share rate (copied/shared vs created)
- Return creators (someone who makes 2+ gifts)
