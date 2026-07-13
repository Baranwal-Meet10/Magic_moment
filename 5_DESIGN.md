# 🎨 GiftLink — Design & UX

## 1. Visual Tone
Playful, warm, a little magical — think confetti, soft gradients, rounded shapes, and a "present" being unwrapped. Avoid corporate/SaaS look; this should feel like a greeting card app, not a dashboard.

- **Color palette**: warm gradient base (blush pink → soft gold, or customizable per theme) with a bright accent (confetti colors) for celebratory moments
- **Typography**: a friendly rounded sans-serif for UI (e.g. Poppins/Quicksand) + an optional handwritten-style font for the gift message itself, to feel personal
- **Motion**: everything about opening a gift should feel tactile — easing curves that mimic real unwrapping (ease-out, slight bounce), not linear/robotic transitions

## 2. Key Screens

### Landing Page
- Big friendly headline ("Send a gift they'll actually enjoy opening")
- One clear CTA: "Create a Gift"
- Maybe a live example/demo gift they can tap to preview the unwrap effect

### Create Gift Form
- Step-based (not one long form): 1) Message  2) Image(s)  3) Lock/policy  4) Theme/effect  5) (Phase 4) Premium upsell  6) Get link
- Live preview panel showing roughly how it'll look

### Public Reveal Page (`/g/[slug]`)
- First view: closed gift (box/envelope/card) with a "Tap to open" prompt
- Optional name/PIN prompt appears before the box responds, if locked
- Tap → reveal animation plays → message + image fade/slide in
- "Skip animation" link, small and unobtrusive, for accessibility/impatience
- After open (if one-time): friendly "This gift has already been opened 💌" screen, not an error-style message

### Already-Opened / Expired State
- Warm, non-error tone: "This little surprise has already been unwrapped" rather than a technical "410 Gone" feel

## 3. Reveal Effects (Design Spec)

| Effect | Visual | Sound (optional, mutable) | Tier |
|---|---|---|---|
| Confetti burst | Canvas confetti particles bursting from center | Soft "pop" | Free |
| Envelope | Envelope flap opens, letter slides up and unfolds | Paper rustle | Free |
| Ribbon unwrap | Box lid opens, ribbon peels off in 2 halves | Ribbon "swish" | Free |
| Fireworks | Layered particle fireworks bursts | Firework crackle | Premium |
| Snowfall | Ambient falling snow + soft glow reveal | Wind chime | Premium |
| Custom video intro | Short branded/animated clip plays before reveal | Custom audio | Premium |

**Implementation note:** each effect is a self-contained component under `/components/effects/`, registered in a central `effectsRegistry.ts`, so designers/devs can add new ones without touching the reveal page logic.

## 4. Accessibility
- All animations must respect `prefers-reduced-motion` — fall back to a simple fade
- "Skip animation" always visible, not hidden behind a hover state
- Sufficient color contrast on all text over gradient backgrounds (check against WCAG AA)
- Sound effects default OFF or muted-start, with a visible mute/unmute toggle — never autoplay loud sound

## 5. Payment/Upsell UI (Phase 4)
- Premium effects shown with a small "✨ Premium" badge in the theme picker, not hidden until checkout — no surprise paywalls
- Checkout via hosted Stripe/Razorpay page — keep GiftLink's own UI out of card-entry entirely
- After payment, return to the same create-flow step with premium effect now unlocked (not a jarring separate confirmation page)
- Always show price clearly before redirecting to checkout

## 6. Mobile-First Notes
- Most gifts will be opened on mobile (from a shared chat link) — design and test reveal animations on small screens first, desktop second
- Tap targets ≥44px, avoid hover-only interactions
