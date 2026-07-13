# 📏 GiftLink — Project Rules & Conventions

## 1. General Principles
- Ship the MVP scope first — resist adding Phase 3/4 features early
- Every feature should degrade gracefully (e.g. no JS/slow network → still show the gift, just skip animation)
- Prefer boring, well-supported libraries over trendy ones — this is a small fun app, not a tech showcase
- Never block the "reveal" behind anything that can silently fail (payment checks, animation libs, etc.) — always have a fallback path to just show the content

## 2. Folder Structure Convention

```
/app or /pages          → Next.js routes
/components             → Shared UI components
/components/effects     → Reveal animation components (pluggable)
/lib                    → Helper functions (slug gen, validation, etc.)
/lib/supabase           → Supabase client + queries
/lib/payments           → Stripe/Razorpay helpers (Phase 4)
/styles                 → Tailwind config/globals
/public                 → Static assets
/docs                   → All project .md files (this set)
```

## 3. Naming Conventions
- Files: `kebab-case` for routes/assets, `PascalCase` for React components
- DB tables: `snake_case`, plural (`gifts`, `open_events`)
- API routes: `/api/<resource>/<action>` (e.g. `/api/gifts/create`)
- Env vars: `UPPER_SNAKE_CASE`, prefixed by service (`SUPABASE_URL`, `STRIPE_SECRET_KEY`)

## 4. Git Workflow
- `main` = always deployable
- Feature branches: `feature/<short-name>` (e.g. `feature/name-lock`)
- Commit messages: `type: short description` (e.g. `feat: add one-time-open logic`, `fix: slug collision bug`)
- No direct commits to `main` once a second contributor joins — PR + review required

## 5. Code Style
- TypeScript preferred over plain JS for anything beyond a quick prototype
- Keep API route handlers thin — push logic into `/lib` helpers so it's testable
- Validate all user input server-side (never trust client-side checks alone) — especially for open_policy and payment status
- No secrets/API keys committed to repo — use `.env.local` + Vercel env vars

## 6. Security Rules (non-negotiable)
- Never trust a client-reported "payment successful" — always confirm via webhook
- Always hash/never log PIN codes or recipient names in plaintext logs
- Rate-limit gift creation endpoint to prevent spam/image-storage abuse
- Sanitize all uploaded images (strip EXIF/location metadata before storing)
- Slugs must have enough entropy (10+ chars) to resist brute-force guessing

## 7. Content & Moderation Rules
- Add a "Report this gift" link on public gift pages starting Phase 2
- Enforce image size/type limits (e.g. max 5MB, jpg/png/webp only) at upload
- No public gift wall entries without explicit opt-in from creator

## 8. Definition of "Done" for any feature
A feature is done when:
- [ ] Works on mobile + desktop
- [ ] Has a fallback if animation/JS fails to load
- [ ] Server-side validates all relevant input
- [ ] Added/updated in `MEMORY.md` progress tracker
- [ ] No secrets or debug logs left in code
