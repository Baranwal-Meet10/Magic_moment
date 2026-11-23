# Phase 4: Creator Page Appearance Section & Trigger (`src/routes/create.tsx`)

## Goal
Integrate the Theme Drawer into `/create`, updating the theme selector to match the layout and design in Image 1.

## Requirements
1. **Appearance Section Layout**:
   - Replace the existing 5-button inline grid with:
     - Theme Trigger Button:
       - Displays `Theme` (or current theme name with preview swatch)
       - Styled with warm pink accent, rounded edges, and tactile hover/press states.
       - Clicking opens the right-side `ThemeDrawer`.
2. **Live Gift Box Preview**:
   - Placed directly underneath the Theme trigger button.
   - Header badge: `Live Preview: [Theme Name] Theme ([Emoji])`
   - Real-time `MobileGiftBox` rendering that responds immediately to theme changes selected in the drawer.
3. **Form State Synchronization**:
   - Manage `theme` state (`selectedTheme`) in `CreatePage`.
   - Ensure theme persists during photo upload and message entry.
