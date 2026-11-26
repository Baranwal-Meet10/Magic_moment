# Phase 6: Quality Assurance, Verification & Polish

## Status: ⚠️ Partially complete (Build, Lint & Contrast verified; Live Browser QA pending manual check)

## Goal
Verify the entire end-to-end theme system across browsers, screen sizes, SSR builds, and accessibility standards.

## Verification Checklist

1. **Full Production & SSR Build Verification**:
   - [x] Run `.\node_modules\.bin\tsc.cmd --noEmit` — passed (`exit code 0`).
   - [x] Run `.\node_modules\.bin\vite.cmd build` — client, SSR, and Nitro (`cloudflare-module`) bundles compiled cleanly (`exit code 0`).
   - [x] Run `.\node_modules\.bin\eslint.cmd --rule "prettier/prettier: off"` on all theme-related files — `0` errors (`exit code 0`).

2. **12-Theme Contrast & Visual Audit**:
   - [x] Computed WCAG 2.1 AA contrast ratios across all 12 themes in `src/lib/theme.ts`:
     - Fixed `birthday` `buttonGradient` first stop (`oklch(0.68 0.18 25)` → `oklch(0.54 0.21 20)`), raising minimum white-text button contrast from `3.13:1` to `5.66:1`.
     - Darkened `accentText` on `birthday`, `love`, `welcome`, and `sunset` so all 12 themes clear `>= 4.5:1` AA contrast against both card backgrounds (`6.08:1`–`13.99:1`) and page gradients (`4.72:1`–`9.88:1`).
   - [x] Fixed Live Preview gift bow overlapping `"Live Preview: ... Theme"` label in `src/routes/create.tsx` (`mb-4` + `mt-1 -mb-3`).
   - [ ] Manual visual spot-check in a live browser across light (`birthday`, `welcome`, `thanks`, `botanical`) and dark (`congrats`, `celestial`, `romance`) themes *(blocked in agent session: Chrome DevTools MCP not connected)*.

3. **Interactive Drawer & Creation Flow**:
   - [ ] Open `/create` in a live browser and cycle through themes in `ThemeDrawer`, testing `"Done"`, top-right close `X`, and `Escape` persistence.
   - [ ] Complete gift creation with/without photo *(requires applying `supabase/migration/20261119190000_expand_theme_whitelist.sql` to Supabase for the 7 new themes to persist instead of falling back to `birthday`)*.

4. **Recipient Reveal & Unwrap Experience**:
   - [ ] Open generated `/g/:slug` link, tap unwrap, verify confetti/emojis/message card, and reload for `AlreadyOpened` screen.

5. **Mobile & Accessibility Audit**:
   - [x] Added `max-w-full` to the `min-w-[7cm]` Theme button in `src/routes/create.tsx` to prevent overflow on `<340px` viewports.
   - [x] Added `focus-visible` rings to the revealed & `AlreadyOpened` CTA `<Link>` buttons in `src/routes/g.$slug.tsx` (matching `ThemeDrawer`, `MobileButton`, and `/create`).
   - [ ] Live mobile viewport (`<400px`) & keyboard (`Tab`, `Enter`, `Escape`) smoke test in browser.

6. **Repository Guardrail**:
   - [x] ⚠️ **Strict User Rule**: Never commit without explicit user permission. Always report findings and obtain approval before running any git commit commands.
