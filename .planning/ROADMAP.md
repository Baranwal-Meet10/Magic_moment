# 🎯 GiftLink Theme Drawer & 12 Mood Themes — GSD Roadmap

## Overview
Implement a comprehensive theme system with a dedicated slide-over right-side Theme Drawer (`ThemeDrawer`), expanding from 5 basic themes to 12 rich visual mood themes, matching design specifications.

---

## 📌 Phase Status & Dependency Graph

```
[Phase 1: Theme Engine (12 Themes)] ✅
        │
        ├──> [Phase 2: DB & Supabase RPC Migration] ✅
        │
        ├──> [Phase 3: Right-Side Theme Drawer Component] ✅
        │            │
        │            └──> [Phase 4: Creator Page Appearance Section & Trigger] ✅
        │                        │
        │                        ├──> [Phase 4a: Creator Page Themed UI Polish] ✅
        │                        │           │
        └────────────────────────┴───> [Phase 5: Receiver /g/:slug Reveal Sync] ⚠️
                                             │
                                             └──> [Phase 6: QA, Build & Polish] 🔲
```

| Phase | Title | Status | Scope / Deliverables |
|---|---|---|---|
| **Phase 1** | Theme Engine Expansion | ✅ Done | 12 mood themes, `ThemeId`, `ThemeConfig`, safe fallback in `src/lib/theme.ts`. |
| **Phase 2** | Database Schema & RPC Hardening | ✅ Done | Migration `20261119190000` + client defensive fallback in `create.tsx`. |
| **Phase 3** | Right-Side Theme Drawer Component | ✅ Done | `src/components/theme-drawer.tsx` with 12 preview cards, single close button, sticky footer. |
| **Phase 4** | Creator Page Appearance Section & Trigger | ✅ Done | Centered ~3cm Theme pill button with `Palette` icon, `Live Preview` box, drawer state sync. |
| **Phase 4a** | Creator Page Themed UI Polish | ✅ Done | Extended `ThemeConfig` with `buttonGradient`, `buttonTextColor`, `cardTint`, `previewBg`; `/create` dynamically matches all 12 themes. |
| **Phase 5** | Receiver Reveal Experience Sync | ⚠️ In Progress | Sync remaining reveal page surfaces (`accentText` token wiring, themed CTA buttons on reveal & already-opened screens). |
| **Phase 6** | Quality Assurance, Verification & Polish | 🔲 Not started | Full client + SSR build validation, contrast check across light & dark themes, mobile touch audits. (Never commit without user approval). |

---

## 🚀 Execution Phases

### Phase 1: Theme Engine Expansion (`src/lib/theme.ts`) — ✅ Done
- **Objective**: Define all 12 themes with complete visual specifications (color schemes, gradients, 3D box styles, confetti/emojis, badges, card accents, and illustrations).
- **Deliverables**:
  - `ThemeId` union type updated to 12 theme IDs.
  - Full `ThemeConfig` records for all 12 themes with authentic illustrations / mini-cards (`drawerPreview`).
  - Safe fallback mechanism ensuring graceful degradation to `birthday`.

### Phase 2: Database Schema & RPC Hardening (`supabase/`) — ✅ Done
- **Objective**: Update backend stored procedures to permit all 12 themes without throwing `invalid theme` exceptions.
- **Deliverables**:
  - Migration SQL (`supabase/migration/20261119190000_expand_theme_whitelist.sql`).
  - Client-side defensive fallback in `/create` submission to protect against outdated backend schemas.

### Phase 3: Right-Side Theme Drawer Component (`src/components/theme-drawer.tsx`) — ✅ Done
- **Objective**: Create the slide-over Theme Drawer matching design mockup.
- **Deliverables**:
  - Built with Radix Sheet (`Sheet`, `SheetContent side="right"`).
  - Header: eyebrow text, `Choose a theme` title, subtitle, scroll hint, single accessible close button.
  - 2-Column Theme Card Grid with 12 mood banners, active selection highlight, instant state dispatch.
  - Sticky Footer with pink pill `Done` button.

### Phase 4: Creator Page Appearance Section & Trigger (`src/routes/create.tsx`) — ✅ Done
- **Objective**: Integrate theme selection on `/create` with centered trigger and live preview.
- **Deliverables**:
  - `Appearance` section with centered Theme pill button (~3cm width, `Palette` icon, warm gradient, tactile feedback).
  - Live Gift Box preview container showing real-time 3D box preview with the chosen theme.
  - Smooth drawer open/close state management.

### Phase 4a: Creator Page Themed UI Polish (`src/lib/theme.ts`, `src/routes/create.tsx`) — ✅ Done
- **Objective**: Make buttons, form card, and preview container adapt dynamically per-theme so each of the 12 moods feels cohesive on `/create`.
- **Deliverables**:
  - Extend `ThemeConfig` with `buttonGradient`, `buttonTextColor`, `cardTint`, `previewBg` tokens.
  - Populate distinct accent values for all 12 themes.
  - Replace hardcoded `bg-gradient-warm` on Theme trigger button and Submit button with dynamic per-theme gradient & text color.
  - Add subtle themed tint to the Live Preview container and form card border.
  - Verify WCAG AA text contrast on all themed buttons.

### Phase 5: Receiver Reveal Experience Sync (`src/routes/g.$slug.tsx`) — ⚠️ In Progress
- **Objective**: Ensure all 12 themes fully style the recipient unwrap page and replace remaining hardcoded pink accents.
- **Deliverables**:
  - Already implemented: theme background gradient, ambient glow, 3D gift box, unwrap animations, confetti particles & theme emojis.
  - Remaining: Replace hardcoded `bg-gradient-warm` on the reveal CTA and AlreadyOpened CTA with `themeConfig.buttonGradient`.
  - Remaining: Connect previously unused `themeConfig.accentText` to creator name / badge styling on the reveal card.

### Phase 6: Quality Assurance, Verification & Polish — 🔲 Not started
- **Objective**: Validate end-to-end user flow, performance, responsive behavior, and accessibility.
- **Deliverables**:
  - Full TypeScript and SSR bundle compilation (`vite build` with zero errors).
  - Visual smoke test across 6 light/dark themes (`birthday`, `welcome`, `thanks`, `congrats`, `celestial`, `romance`).
  - Mobile touch validation (smooth drawer scroll, responsive gift box).
  - Strict compliance with user rules: **Never commit without explicit user permission**.
