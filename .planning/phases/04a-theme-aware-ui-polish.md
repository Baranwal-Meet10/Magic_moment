# Phase 4a: Creator Page Themed UI Polish (`src/lib/theme.ts`, `src/routes/create.tsx`)

## Status: ✅ Done

## Problem Statement
When selecting different themes on `/create`, the page **background** changes via `selectedThemeConfig.bgGradient` and the **3D gift box** in the Live Preview updates its colors — but key buttons and containers on `/create` stay hardcoded to the Birthday warm pink palette regardless of which theme is active:

1. **Theme trigger button** — Uses fixed `bg-gradient-warm`. Should reflect the active theme's accent color.
2. **"Wrap the gift & get link" submit button** — Same fixed `bg-gradient-warm`. Should adapt to the selected theme.
3. **Form card** — Uses neutral `bg-card`. Should feature a subtle themed tint/border so the card feels cohesive with the chosen mood.
4. **Live Preview container** — Uses neutral `bg-secondary/50`. Should use a soft tint from the active theme.

*(Note: Receiver reveal page styling belongs strictly to Phase 5).*

## Goal
Make all visible UI surfaces on `/create` respond distinctly to each of the 12 themes so each mood feels like a coherent, unique experience — not just a recolored gift box on a pink button background.

---

## Requirements

### 1. Extend `ThemeConfig` with UI accent tokens
Add these new fields to `ThemeConfig` in `src/lib/theme.ts`:

```ts
// Gradient for Theme trigger & Submit buttons
buttonGradient: string;       // e.g. "linear-gradient(135deg, ...)"

// Text color for buttons (defaults to white, ensures WCAG AA compliance for light themes)
buttonTextColor?: string;     // e.g. "text-white" or "text-emerald-950"

// Subtle form card tint (applied as border-color or faint accent)
cardTint: string;             // e.g. "oklch(0.75 0.12 150 / 0.12)"

// Live preview container background
previewBg: string;            // e.g. "oklch(0.95 0.03 150 / 0.5)"
```

### 2. Populate all 12 themes with unique accent tokens
Each theme must receive visually distinct tokens matching its mood:

| Theme | Button Gradient Direction | Button Text Color | Preview Tint |
|---|---|---|---|
| birthday | warm pink → magenta | text-white | soft peach |
| love | deep rose → blush pink | text-white | blush wash |
| thanks | sage green → olive gold | text-white | earthy mint |
| holiday | forest green → gold | text-white | icy pine |
| welcome | sunny amber → warm yellow | text-amber-950 / text-white | golden cream |
| congrats | royal purple → gold | text-white | faint purple |
| celestial | deep indigo → cosmic violet | text-white | cosmic blue |
| ocean | teal → seafoam | text-white | aqua tint |
| party | hot magenta → electric purple | text-white | faint neon violet |
| romance | deep burgundy → rose gold | text-white | warm candlelight |
| botanical | leaf green → soft peach | text-white | botanical mint |
| sunset | burnt orange → amber pink | text-white | warm peach |

### 3. Apply themed tokens on Creator page (`src/routes/create.tsx`)
- **Theme trigger button**: Replace `bg-gradient-warm` with inline `style={{ background: selectedThemeConfig.buttonGradient }}` and apply `selectedThemeConfig.buttonTextColor || "text-primary-foreground"`.
- **Submit button**: Replace `bg-gradient-warm` with inline `style={{ background: selectedThemeConfig.buttonGradient }}`.
- **Live Preview container**: Replace `bg-secondary/50` with inline `style={{ background: selectedThemeConfig.previewBg }}`.
- **Form card border**: Add subtle themed border accent using `selectedThemeConfig.cardTint`.

### 4. Smooth transitions & Accessibility
- Ensure all themed buttons and containers include `transition-all duration-300` for smooth theme-swap animations.
- Check WCAG 2.1 AA text contrast (4.5:1 minimum) against button gradients across all 12 themes.
- Ensure focus rings (`focus-visible:ring-primary`) remain clearly visible.

---

## Verification Checklist
- [x] `tsc --noEmit` passes with 0 errors
- [x] Every theme displays a distinct, coordinated button and preview color on `/create`
- [x] Text on all themed buttons is clearly readable (WCAG AA)
- [x] Theme switching transitions smoothly without layout shifts
- [x] No git commits made without user permission
