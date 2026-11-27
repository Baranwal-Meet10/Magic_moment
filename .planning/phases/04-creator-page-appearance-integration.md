# Phase 4: Creator Page Appearance Section & Trigger (`src/routes/create.tsx`)

## Status: ✅ Done (Commit `7989c8a`)

## Goal
Integrate the Theme Drawer into `/create`, updating the theme selector to match the layout and design in Image 1.

## Requirements & Implementation
1. **Appearance Section Layout**:
   - Section Label: `Appearance` (medium font, standard form label matching "From", "Your message", "Photo")
   - Centered Theme Trigger Button:
     - Centered horizontally (`flex justify-center`)
     - Compact ~3cm length (`min-w-[3cm] px-4 py-2 text-sm font-semibold`)
     - Styled matching the "Wrap the gift & get link" button (`rounded-full bg-gradient-warm shadow-gift text-primary-foreground`)
     - Icon & Label: `<Palette className="h-4 w-4" /> <span>Theme</span>`
     - Tactile feedback: `hover:scale-105 active:scale-95`
     - Accessible keyboard indicator: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
     - Clicking opens `ThemeDrawer` (`setThemeDrawerOpen(true)`)

2. **Live Gift Box Preview**:
   - Placed directly underneath the Theme trigger button.
   - Header badge: `Live Preview: [Theme Name] Theme ([Emoji])`
   - Real-time `MobileGiftBox` rendering that responds immediately to theme changes selected in the drawer.

3. **Form State Synchronization**:
   - Manages `theme` state (`selectedTheme`) in `CreatePage`.
   - Page background smoothly transitions with `selectedThemeConfig.bgGradient`.
   - Theme persists during photo upload and message entry.
