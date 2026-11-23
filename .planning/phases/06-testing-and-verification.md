# Phase 6: Quality Assurance, Verification & Polish

## Status: 🔲 Not started

## Goal
Verify the entire end-to-end theme system across browsers, screen sizes, SSR builds, and accessibility standards.

## Verification Checklist

1. **Full Production & SSR Build Verification**:
   - Run `npx tsc --noEmit` to confirm complete TypeScript type safety.
   - Run `vite build` (or `npm run build`) to guarantee both client and server (SSR) bundles compile with zero errors.

2. **12-Theme Visual Smoke Test**:
   - Spot-check at least 6 diverse themes spanning both light and dark palettes:
     - Light: `birthday` (warm peach), `welcome` (golden amber), `thanks` (sage green), `botanical` (mint/bloom)
     - Dark: `congrats` (royal purple), `celestial` (cosmic midnight), `romance` (burgundy candle)
   - Verify WCAG 2.1 AA text contrast on all themed buttons and badges.

3. **Interactive Drawer & Creation Flow**:
   - Open `/create`.
   - Tap "Theme" button (~3cm centered pill). Verify drawer slides in smoothly from the right.
   - Cycle through theme cards. Verify live 3D preview box, header badge, and background change immediately.
   - Close drawer using either "Done" or the top-right close icon. Verify theme persists.
   - Complete gift creation (with and without optional photo).

4. **Recipient Reveal & Unwrap Experience**:
   - Open generated `/g/:slug` link.
   - Verify theme background and ambient glow.
   - Tap unwrap. Verify box lid pops, confetti & thematic emojis burst, message card appears with theme border and accent text, and CTA button matches theme.
   - Refresh page to verify AlreadyOpened screen displays matching theme background and button styling.

5. **Mobile & Accessibility Audit**:
   - Test viewport width under 400px (iPhone SE, compact Android).
   - Verify drawer scrolls smoothly without clipping sticky footer.
   - Confirm focus indicators (`focus-visible`) are visible when navigating via keyboard (`Tab`, `Enter`, `Escape`).

6. **Repository Guardrail**:
   - ⚠️ **Strict User Rule**: Never commit without explicit user permission. Always report findings and obtain approval before running any git commit commands.
