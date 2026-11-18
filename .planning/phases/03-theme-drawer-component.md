# Phase 3: Right-Side Theme Drawer Component (`ThemeDrawer`)

## Goal
Build a dedicated slide-over right-side Theme Drawer component that matches Image 2 from the design mockup.

## Requirements
1. **Component Specs**:
   - Location: `src/components/theme-drawer.tsx`
   - Underlying Primitive: Radix UI `Sheet` / `SheetContent side="right"`
   - Width: Responsive (full width / `w-[92vw]` on small mobile screens, `sm:max-w-md` or `md:max-w-lg` on tablets/desktops)

2. **Drawer Header**:
   - Eyebrow: `MAKE IT THEIR KIND OF SPECIAL` (uppercase, tracking-wider, terracotta/rose-tinted)
   - Title: `Choose a theme` (bold, serif or high-contrast display font)
   - Subtitle: `12 different moods. One thoughtful gift.`
   - Scroll hint: `Scroll to explore every style ↓`
   - Round close button with `X` icon in upper right

3. **2-Column Theme Grid**:
   - Two columns (`grid grid-cols-2 gap-3.5`)
   - Recreate the 12 themed illustrated preview cards:
     - Card top: Graphic visual preview banner (e.g. Birthday box, Love envelope with hearts, Botanical leaf card, Christmas tree, Rainbow arches, Golden You Did It badge, Cosmic planets, Ocean wave greeting, etc.)
     - Card bottom:
       - Theme Name (e.g., "Birthday", "Love", "Thanks", "Holiday")
       - Mood tagline (e.g., "Confetti & celebration", "Blush & handwritten hearts")
     - Interactive Selection:
       - Active card has primary highlight border, subtle background tint, or checkmark badge.
       - Tapping a card immediately selects the theme and triggers live preview updates.

4. **Sticky Drawer Footer**:
   - High-contrast rounded pill "Done" button (`bg-primary` / magenta-pink)
   - Clicking "Done" closes the drawer.
