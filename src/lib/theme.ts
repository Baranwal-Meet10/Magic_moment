// ---------------------------------------------------------------------------
// theme.ts — Theme Engine for GiftLink
// ---------------------------------------------------------------------------
// Defines visual themes (colors, box styles, ribbon, halo glow, background,
// confetti palettes, badges) used by /create and /g/:slug.
// ---------------------------------------------------------------------------

export type ThemeId = "birthday" | "love" | "thanks" | "holiday" | "welcome";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  emoji: string;
  badgeText: string;
  // Swatch used in creator theme selector
  swatch: string;
  // Page background gradient
  bgGradient: string;
  // Gift Box styling
  boxGradient: string;
  lidColor: string;
  ribbonColor: string;
  bowKnotColor: string;
  // Glow halo behind box
  haloGradient: string;
  unwrapHaloGradient: string;
  // Confetti / Sparkle color palette
  confettiColors: string[];
  // Card border / accent color
  cardAccentBorder: string;
  accentText: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  birthday: {
    id: "birthday",
    label: "Birthday",
    emoji: "🎉",
    badgeText: "Happy Birthday!",
    swatch: "bg-gradient-to-r from-[oklch(0.72_0.17_25)] via-[oklch(0.66_0.20_15)] to-[oklch(0.80_0.14_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.985 0.015 75) 0%, oklch(0.95 0.04 65) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.72 0.17 25) 0%, oklch(0.66 0.20 15) 50%, oklch(0.55 0.18 350) 100%)",
    lidColor: "oklch(0.55 0.22 15)",
    ribbonColor: "oklch(0.80 0.14 85)",
    bowKnotColor: "oklch(0.65 0.18 75)",
    haloGradient: "radial-gradient(circle, oklch(0.75 0.18 30 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.80 0.14 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.72 0.17 25)",
      "oklch(0.80 0.14 85)",
      "oklch(0.66 0.20 15)",
      "oklch(0.65 0.15 150)",
      "oklch(0.62 0.20 350)",
      "oklch(0.85 0.12 200)",
    ],
    cardAccentBorder: "border-[oklch(0.72_0.17_25)]/30",
    accentText: "text-[oklch(0.66_0.20_15)]",
  },
  love: {
    id: "love",
    label: "Love",
    emoji: "❤️",
    badgeText: "With All My Love",
    swatch: "bg-gradient-to-r from-[oklch(0.60_0.24_15)] via-[oklch(0.55_0.25_5)] to-[oklch(0.75_0.18_350)]",
    bgGradient: "linear-gradient(180deg, oklch(0.98 0.02 10) 0%, oklch(0.94 0.05 350) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.58 0.24 15) 0%, oklch(0.50 0.26 5) 60%, oklch(0.42 0.22 350) 100%)",
    lidColor: "oklch(0.45 0.25 10)",
    ribbonColor: "oklch(0.88 0.10 80)",
    bowKnotColor: "oklch(0.75 0.16 30)",
    haloGradient: "radial-gradient(circle, oklch(0.65 0.22 15 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.78 0.16 350 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.60 0.24 15)",
      "oklch(0.70 0.20 350)",
      "oklch(0.85 0.12 20)",
      "oklch(0.50 0.25 5)",
      "oklch(0.92 0.08 80)",
    ],
    cardAccentBorder: "border-[oklch(0.60_0.24_15)]/30",
    accentText: "text-[oklch(0.55_0.25_5)]",
  },
  thanks: {
    id: "thanks",
    label: "Thanks",
    emoji: "🍃",
    badgeText: "With Heartfelt Thanks",
    swatch: "bg-gradient-to-r from-[oklch(0.55_0.15_150)] via-[oklch(0.65_0.18_140)] to-[oklch(0.78_0.14_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.98 0.015 140) 0%, oklch(0.94 0.04 150) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.50 0.16 150) 0%, oklch(0.42 0.18 140) 60%, oklch(0.35 0.15 160) 100%)",
    lidColor: "oklch(0.38 0.16 145)",
    ribbonColor: "oklch(0.82 0.15 85)",
    bowKnotColor: "oklch(0.70 0.16 80)",
    haloGradient: "radial-gradient(circle, oklch(0.55 0.16 145 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.80 0.14 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.55 0.15 150)",
      "oklch(0.70 0.18 140)",
      "oklch(0.82 0.15 85)",
      "oklch(0.45 0.14 160)",
      "oklch(0.90 0.10 90)",
    ],
    cardAccentBorder: "border-[oklch(0.55_0.15_150)]/30",
    accentText: "text-[oklch(0.45_0.16_145)]",
  },
  holiday: {
    id: "holiday",
    label: "Holiday",
    emoji: "✨",
    badgeText: "Happy Holidays!",
    swatch: "bg-gradient-to-r from-[oklch(0.45_0.20_290)] via-[oklch(0.40_0.22_270)] to-[oklch(0.82_0.16_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.97 0.02 280) 0%, oklch(0.93 0.05 270) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.45 0.20 290) 0%, oklch(0.38 0.22 270) 60%, oklch(0.30 0.24 280) 100%)",
    lidColor: "oklch(0.32 0.22 285)",
    ribbonColor: "oklch(0.85 0.16 85)",
    bowKnotColor: "oklch(0.72 0.18 75)",
    haloGradient: "radial-gradient(circle, oklch(0.50 0.20 280 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.16 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.50 0.20 290)",
      "oklch(0.85 0.16 85)",
      "oklch(0.60 0.22 270)",
      "oklch(0.75 0.14 260)",
      "oklch(0.95 0.05 90)",
    ],
    cardAccentBorder: "border-[oklch(0.45_0.20_290)]/30",
    accentText: "text-[oklch(0.40_0.22_270)]",
  },
  welcome: {
    id: "welcome",
    label: "Welcome",
    emoji: "🌟",
    badgeText: "A Warm Welcome!",
    swatch: "bg-gradient-to-r from-[oklch(0.60_0.16_200)] via-[oklch(0.65_0.18_180)] to-[oklch(0.85_0.16_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.98 0.02 195) 0%, oklch(0.94 0.04 185) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.58 0.16 200) 0%, oklch(0.52 0.18 185) 60%, oklch(0.45 0.15 210) 100%)",
    lidColor: "oklch(0.42 0.18 195)",
    ribbonColor: "oklch(0.85 0.16 85)",
    bowKnotColor: "oklch(0.72 0.17 75)",
    haloGradient: "radial-gradient(circle, oklch(0.58 0.16 195 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.16 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.60 0.16 200)",
      "oklch(0.85 0.16 85)",
      "oklch(0.65 0.18 180)",
      "oklch(0.75 0.15 150)",
      "oklch(0.92 0.08 90)",
    ],
    cardAccentBorder: "border-[oklch(0.60_0.16_200)]/30",
    accentText: "text-[oklch(0.50_0.18_195)]",
  },
};

/**
 * Safely get theme configuration with fallback to birthday theme
 */
export function getThemeConfig(themeId?: string | null): ThemeConfig {
  if (themeId && themeId in THEMES) {
    return THEMES[themeId as ThemeId];
  }
  return THEMES.birthday;
}
