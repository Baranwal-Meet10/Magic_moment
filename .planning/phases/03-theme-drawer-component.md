# Phase 3: Right-Side Theme Drawer Component (`ThemeDrawer`)

## Status: ✅ Done (Commit `d29eb12`)

## Goal
Build a dedicated slide-over right-side Theme Drawer component that matches Image 2 from the design mockup.

## Requirements & Implementation
1. **Component Specs**:
   - Location: `src/components/theme-drawer.tsx`
   - Underlying Primitive: Radix UI `Sheet` / `SheetContent side="right"`
   - Width: Responsive (`max-w-[95vw] sm:max-w-[480px]`)

2. **Drawer Header**:
   - Eyebrow: `MAKE IT THEIR KIND OF SPECIAL` (uppercase, tracking-[0.18em], #9e4438)
   - Title: `Choose a theme` (font-serif text-2xl font-bold)
   - Subtitle: `12 different moods. One thoughtful gift.`
   - Scroll hint: `Scroll to explore every style ↓`
   - Single Accessible Close Button: Uses Radix `SheetContent`'s built-in `SheetPrimitive.Close` at `right-4 top-4`. Drawer header has `pr-8` to ensure title text never overlaps.

3. **2-Column Theme Grid**:
   - Two columns (`grid grid-cols-2 gap-3.5 pb-8`)
   - 12 illustrated preview cards:
     - Card top: Graphic visual preview banner (e.g. Birthday box, Love envelope with hearts, Botanical leaf card, Christmas tree, Rainbow arches, Golden banner, Cosmic planets, Ocean wave greeting, etc.)
     - Card bottom:
       - Theme Name (e.g., "Birthday", "Love", "Thanks", "Holiday")
       - Mood tagline (e.g., "Confetti & celebration", "Blush & handwritten hearts")
     - Interactive Selection:
       - Active card has ring highlight border and checkmark badge.
       - Tapping a card immediately selects theme and triggers live preview updates.

4. **Sticky Drawer Footer**:
   - High-contrast rounded pill "Done" button (`bg-[#b8336a]` / magenta-pink)
   - Clicking "Done" closes the drawer.
