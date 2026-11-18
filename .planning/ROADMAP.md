# 🎯 GiftLink Theme Drawer & 12 Mood Themes — GSD Roadmap

## Overview
Implement a comprehensive theme system with a dedicated slide-over right-side Theme Drawer (`ThemeDrawer`), expanding from 5 basic themes to 12 rich visual mood themes, matching the provided design specifications.

---

## 📌 Phase Overview & Dependency Graph

```
[Phase 1: Theme Engine (12 Themes)]
        │
        ├──> [Phase 2: DB & Supabase RPC Migration]
        │
        ├──> [Phase 3: Right-Side Theme Drawer Component]
        │            │
        │            └──> [Phase 4: Creator Page Appearance Section & Trigger]
        │                        │
        └────────────────────────┴───> [Phase 5: Receiver /g/:slug Reveal Sync]
                                                │
                                                └──> [Phase 6: QA, Build & Polish]
```

---

## 🚀 Execution Phases

### Phase 1: Theme Engine Expansion (`src/lib/theme.ts`)
- **Objective**: Define all 12 themes with complete visual specifications (color schemes, gradients, 3D box styles, confetti/emojis, badges, card accents, and illustrations).
- **Deliverables**:
  - `ThemeId` union type updated to 12 theme IDs.
  - Full `ThemeConfig` records for all 12 themes with authentic illustrations / mini-cards.
  - Safe fallback mechanism ensuring graceful degradation to `birthday`.

### Phase 2: Database Schema & RPC Hardening (`supabase/`)
- **Objective**: Update the backend stored procedures to permit all 12 themes without throwing `invalid theme` exceptions.
- **Deliverables**:
  - New migration SQL (`supabase/migration/*_add_12_themes_support.sql`).
  - Client-side defensive fallback in `/create` submission to protect against outdated backend schemas.

### Phase 3: Right-Side Theme Drawer Component (`src/components/theme-drawer.tsx`)
- **Objective**: Create the slide-over Theme Drawer matching Image 2.
- **Deliverables**:
  - Built with Radix Sheet (`Sheet`, `SheetContent side="right"`).
  - Header:
    - Eyebrow text: `MAKE IT THEIR KIND OF SPECIAL`
    - Title: `Choose a theme`
    - Subtitle: `12 different moods. One thoughtful gift.`
    - Instruction: `Scroll to explore every style ↓`
    - Circular close button (`X`).
  - 2-Column Theme Card Grid:
    - Visual illustrated theme card preview headers.
    - Theme label & mood description subtitle.
    - Active selection highlight state.
  - Sticky Footer:
    - Pink pill `Done` button that closes the drawer.

### Phase 4: Creator Page Appearance Section & Trigger (`src/routes/create.tsx`)
- **Objective**: Redesign the theme selection on `/create` matching Image 1.
- **Deliverables**:
  - Replace inline theme button grid with:
    - `Appearance` section title.
    - Pink / theme-accented `Theme` trigger button that opens the drawer.
    - Live Gift Box preview container showing real-time 3D box preview with the chosen theme.
  - Smooth drawer open/close state management.

### Phase 5: Receiver Reveal Experience Sync (`src/routes/g.$slug.tsx`)
- **Objective**: Guarantee all 12 themes render and animate on the unwrap / reveal page.
- **Deliverables**:
  - Receiver page background gradient and ambient glow update to match the selected theme.
  - 3D gift box, lid pop, ribbon unwrap, and custom theme confetti/emojis trigger smoothly.

### Phase 6: Quality Assurance, Verification & Polish
- **Objective**: Validate end-to-end user flow, performance, and responsive behavior.
- **Deliverables**:
  - TypeScript compilation and Vite build verification (`npm run build`).
  - Mobile touch validation (smooth scroll, no layout shift).
  - Accessibility audit (ARIA labels, focus management, ESC key handling).
