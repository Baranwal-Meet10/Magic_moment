# Phase 5: Receiver Reveal Experience Sync (`/g/:slug`)

## Goal
Ensure all 12 themes produce consistent, visually stunning results on the recipient unwrap page (`src/routes/g.$slug.tsx`).

## Requirements
1. **Background & Atmosphere**:
   - `selectedThemeConfig.bgGradient` renders across the receiver viewport.
   - Ambient glow halo (`haloGradient` and `unwrapHaloGradient`) radiates correctly behind the box.
2. **Gift Box Rendering**:
   - 3D box gradient, lid color, ribbon color, and bow knot color match the selected theme configuration.
3. **Unwrap Animations & Confetti**:
   - Confetti particle colors match `themeConfig.confettiColors`.
   - Thematic floating emojis (hearts, stars, celebratory emojis) burst as defined in `themeConfig.confettiEmojis`.
4. **Card Accents**:
   - Revealed message card uses `themeConfig.cardAccentBorder` and `themeConfig.accentText`.
