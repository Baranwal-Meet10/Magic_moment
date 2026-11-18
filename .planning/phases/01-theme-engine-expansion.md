# Phase 1: Theme Engine Expansion

## Goal
Expand the theme engine in `src/lib/theme.ts` from 5 basic themes to 12 complete visual mood themes as specified in the UI designs.

## Requirements
1. **Theme IDs**:
   - `birthday`: "Confetti & celebration"
   - `love`: "Blush & handwritten hearts"
   - `thanks`: "Earthy & botanical"
   - `holiday`: "Evergreen & snowfall"
   - `welcome`: "Sunshine & soft arches"
   - `congrats`: "Bold & golden"
   - `celestial`: "Midnight & starry wonder"
   - `ocean`: "A sea of good wishes"
   - `party`: "Electric neon & fireworks"
   - `romance`: "Warm candlelight & rose"
   - `botanical`: "Lush greenery & bloom"
   - `sunset`: "Golden hour & warm glow"

2. **Configuration Attributes Per Theme**:
   - `id`: ThemeId
   - `label`: Display name
   - `tagline`: Description (e.g. "Blush & handwritten hearts")
   - `emoji`: Character icon
   - `badgeText`: Header banner text
   - `swatch`: Color swatch CSS classes
   - `bgGradient`: Full page background gradient (light & immersive)
   - `boxGradient`: 3D gift box gradient
   - `lidColor`: Lid solid / gradient color
   - `ribbonColor`: Ribbon wrap color
   - `bowKnotColor`: Ribbon knot color
   - `haloGradient`: Ambient back-glow
   - `unwrapHaloGradient`: Unwrap explosion glow
   - `confettiColors`: Theme confetti palette
   - `confettiEmojis`: Array of thematic floating emojis (e.g., hearts for love, stars for celestial, champagne for congrats)
   - `cardAccentBorder`: Border styling
   - `accentText`: Typography color class
   - `previewStyle`: Styles and visual elements for the drawer preview card

3. **Backward Compatibility**:
   - `getThemeConfig(themeId?: string | null): ThemeConfig` must safely fallback to `birthday` for invalid or unknown theme IDs.
