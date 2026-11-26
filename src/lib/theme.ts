// ---------------------------------------------------------------------------
// theme.ts — Theme Engine for GiftLink
// ---------------------------------------------------------------------------
// Defines 12 rich visual mood themes (colors, box styles, ribbon, halo glow,
// background, confetti palettes, badges, preview visual motifs) used by
// /create, ThemeDrawer, and /g/:slug reveal choreography.
// ---------------------------------------------------------------------------

export type ThemeId =
  | "birthday"
  | "love"
  | "thanks"
  | "holiday"
  | "welcome"
  | "congrats"
  | "celestial"
  | "ocean"
  | "party"
  | "romance"
  | "botanical"
  | "sunset";

export interface ThemeDrawerCardPreview {
  bg: string;
  badge?: string;
  tagline?: string;
  accentTextColor: string;
  motifType:
    | "giftbox"
    | "envelope"
    | "note"
    | "tree"
    | "arches"
    | "golden-banner"
    | "celestial"
    | "waves"
    | "disco"
    | "candle"
    | "bloom"
    | "horizon";
}

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  tagline: string;
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
  // Theme-specific sprinkle emojis (each falling particle is an individual emoji).
  confettiEmojis?: string[];
  // Card border / accent color
  cardAccentBorder: string;
  accentText: string;
  // Phase 4a: Creator UI dynamic accent tokens
  buttonGradient: string;
  buttonTextColor?: string;
  cardTint: string;
  previewBg: string;
  // Theme drawer card visual design
  drawerPreview: ThemeDrawerCardPreview;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  birthday: {
    id: "birthday",
    label: "Birthday",
    tagline: "Confetti & celebration",
    emoji: "🎉",
    badgeText: "Happy Birthday!",
    swatch: "bg-gradient-to-r from-[oklch(0.72_0.17_25)] via-[oklch(0.66_0.20_15)] to-[oklch(0.80_0.14_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.97 0.025 75) 0%, oklch(0.92 0.055 45) 100%)",
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
    confettiEmojis: ["🥳", "🎈", "🎁"],
    cardAccentBorder: "border-[oklch(0.72_0.17_25)]/30",
    accentText: "text-[oklch(0.48_0.21_15)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.54 0.21 20) 0%, oklch(0.49 0.22 10) 50%, oklch(0.45 0.20 350) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.72 0.15 25 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.96 0.03 65 / 0.75) 0%, oklch(0.93 0.05 45 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #fff2eb 0%, #ffe4d6 100%)",
      badge: "Confetti & celebration",
      accentTextColor: "text-amber-800",
      motifType: "giftbox",
    },
  },

  love: {
    id: "love",
    label: "Love",
    tagline: "Blush & handwritten hearts",
    emoji: "❤️",
    badgeText: "With All My Love",
    swatch: "bg-gradient-to-r from-[oklch(0.60_0.24_15)] via-[oklch(0.55_0.25_5)] to-[oklch(0.75_0.18_350)]",
    bgGradient: "linear-gradient(180deg, oklch(0.97 0.03 10) 0%, oklch(0.91 0.065 352) 100%)",
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
    confettiEmojis: ["💖", "💋", "💘", "💓", "💞"],
    cardAccentBorder: "border-[oklch(0.60_0.24_15)]/30",
    accentText: "text-[oklch(0.46_0.24_5)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.58 0.24 12) 0%, oklch(0.48 0.24 358) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.65 0.20 5 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.96 0.035 5 / 0.75) 0%, oklch(0.92 0.06 352 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #fdf0f2 0%, #fadce1 100%)",
      badge: "A little love, wrapped up",
      tagline: "Just for you",
      accentTextColor: "text-rose-800",
      motifType: "envelope",
    },
  },

  thanks: {
    id: "thanks",
    label: "Thanks",
    tagline: "Earthy & botanical",
    emoji: "🙏🏼",
    badgeText: "With Heartfelt Thanks",
    swatch: "bg-gradient-to-r from-[oklch(0.55_0.15_150)] via-[oklch(0.65_0.18_140)] to-[oklch(0.78_0.14_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.025 142) 0%, oklch(0.91 0.055 135) 100%)",
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
    confettiEmojis: ["🌱", "✨", "🙏🏼"],
    cardAccentBorder: "border-[oklch(0.55_0.15_150)]/30",
    accentText: "text-[oklch(0.45_0.16_145)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.48 0.15 150) 0%, oklch(0.40 0.16 138) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.55 0.14 145 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.955 0.03 142 / 0.75) 0%, oklch(0.915 0.05 138 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #eef5ea 0%, #d8ebd2 100%)",
      badge: "Thank you.",
      tagline: "A small note of big gratitude",
      accentTextColor: "text-emerald-900",
      motifType: "note",
    },
  },

  holiday: {
    id: "holiday",
    label: "Holiday",
    tagline: "Evergreen & snowfall",
    emoji: "🎄",
    badgeText: "Happy Holidays!",
    swatch: "bg-gradient-to-r from-[oklch(0.42_0.14_165)] via-[oklch(0.35_0.16_155)] to-[oklch(0.82_0.16_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.96 0.025 165) 0%, oklch(0.89 0.055 155) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.40 0.15 165) 0%, oklch(0.32 0.17 155) 60%, oklch(0.24 0.14 170) 100%)",
    lidColor: "oklch(0.28 0.16 160)",
    ribbonColor: "oklch(0.85 0.16 85)",
    bowKnotColor: "oklch(0.72 0.18 75)",
    haloGradient: "radial-gradient(circle, oklch(0.45 0.15 160 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.16 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.45 0.15 160)",
      "oklch(0.85 0.16 85)",
      "oklch(0.60 0.22 25)",
      "oklch(0.75 0.14 150)",
      "oklch(0.95 0.05 90)",
    ],
    confettiEmojis: ["❄️", "⭐", "🎄"],
    cardAccentBorder: "border-[oklch(0.42_0.14_165)]/30",
    accentText: "text-[oklch(0.32_0.17_155)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.38 0.14 162) 0%, oklch(0.30 0.15 152) 65%, oklch(0.44 0.14 100) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.42 0.14 160 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.945 0.03 162 / 0.75) 0%, oklch(0.90 0.05 155 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #1b3a2f 0%, #112820 100%)",
      badge: "Holiday magic",
      tagline: "merry & bright",
      accentTextColor: "text-emerald-200",
      motifType: "tree",
    },
  },

  welcome: {
    id: "welcome",
    label: "Welcome",
    tagline: "Sunshine & soft arches",
    emoji: "☀️",
    badgeText: "A Warm Welcome!",
    swatch: "bg-gradient-to-r from-[oklch(0.75_0.15_60)] via-[oklch(0.70_0.18_45)] to-[oklch(0.85_0.16_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.975 0.035 80) 0%, oklch(0.92 0.075 62) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.72 0.16 55) 0%, oklch(0.64 0.18 45) 60%, oklch(0.52 0.16 35) 100%)",
    lidColor: "oklch(0.50 0.18 40)",
    ribbonColor: "oklch(0.88 0.15 85)",
    bowKnotColor: "oklch(0.74 0.17 75)",
    haloGradient: "radial-gradient(circle, oklch(0.72 0.16 55 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.16 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.75 0.15 60)",
      "oklch(0.85 0.16 85)",
      "oklch(0.65 0.18 40)",
      "oklch(0.75 0.12 180)",
      "oklch(0.92 0.08 90)",
    ],
    confettiEmojis: ["☀️", "🌻", "🌈"],
    cardAccentBorder: "border-[oklch(0.70_0.16_50)]/30",
    accentText: "text-[oklch(0.45_0.17_45)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.85 0.15 85) 0%, oklch(0.76 0.16 68) 100%)",
    buttonTextColor: "text-amber-950",
    cardTint: "oklch(0.72 0.15 62 / 0.40)",
    previewBg: "linear-gradient(180deg, oklch(0.965 0.04 78 / 0.80) 0%, oklch(0.93 0.065 62 / 0.90) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #fef4e2 0%, #fde4ba 100%)",
      badge: "Hello, there.",
      tagline: "A warm welcome awaits",
      accentTextColor: "text-amber-900",
      motifType: "arches",
    },
  },

  congrats: {
    id: "congrats",
    label: "Congrats",
    tagline: "Bold & golden",
    emoji: "🏆",
    badgeText: "You Did It!",
    swatch: "bg-gradient-to-r from-[oklch(0.38_0.22_290)] via-[oklch(0.48_0.20_280)] to-[oklch(0.85_0.18_85)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.03 290) 0%, oklch(0.90 0.065 282) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.40 0.22 290) 0%, oklch(0.32 0.24 280) 60%, oklch(0.24 0.22 295) 100%)",
    lidColor: "oklch(0.28 0.22 285)",
    ribbonColor: "oklch(0.85 0.18 85)",
    bowKnotColor: "oklch(0.74 0.20 75)",
    haloGradient: "radial-gradient(circle, oklch(0.45 0.22 285 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.18 85 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.45 0.22 285)",
      "oklch(0.85 0.18 85)",
      "oklch(0.65 0.22 290)",
      "oklch(0.78 0.15 75)",
      "oklch(0.95 0.08 90)",
    ],
    confettiEmojis: ["⭐", "🏆", "🥂", "✨"],
    cardAccentBorder: "border-[oklch(0.40_0.22_290)]/30",
    accentText: "text-[oklch(0.38_0.22_290)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.42 0.22 290) 0%, oklch(0.34 0.22 280) 70%, oklch(0.48 0.18 305) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.45 0.18 288 / 0.32)",
    previewBg: "linear-gradient(180deg, oklch(0.95 0.035 288 / 0.75) 0%, oklch(0.91 0.06 282 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #321c54 0%, #200f38 100%)",
      badge: "✦ YOU DID IT! ✦",
      tagline: "A celebration for a big moment.",
      accentTextColor: "text-amber-300",
      motifType: "golden-banner",
    },
  },

  celestial: {
    id: "celestial",
    label: "Celestial",
    tagline: "Cosmic wonder & starry night",
    emoji: "🪐",
    badgeText: "Written in the Stars",
    swatch: "bg-gradient-to-r from-[oklch(0.25_0.18_270)] via-[oklch(0.35_0.16_260)] to-[oklch(0.75_0.14_210)]",
    bgGradient: "linear-gradient(180deg, oklch(0.955 0.03 265) 0%, oklch(0.88 0.07 258) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.28 0.16 265) 0%, oklch(0.22 0.18 275) 60%, oklch(0.18 0.15 285) 100%)",
    lidColor: "oklch(0.20 0.16 270)",
    ribbonColor: "oklch(0.85 0.12 210)",
    bowKnotColor: "oklch(0.72 0.16 280)",
    haloGradient: "radial-gradient(circle, oklch(0.35 0.18 270 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.12 210 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.35 0.18 270)",
      "oklch(0.85 0.12 210)",
      "oklch(0.60 0.18 260)",
      "oklch(0.75 0.14 290)",
      "oklch(0.95 0.05 210)",
    ],
    confettiEmojis: ["🌙", "⭐", "🪐", "✨"],
    cardAccentBorder: "border-[oklch(0.35_0.18_270)]/30",
    accentText: "text-[oklch(0.30_0.16_265)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.32 0.16 268) 0%, oklch(0.24 0.16 278) 60%, oklch(0.38 0.16 250) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.38 0.16 265 / 0.32)",
    previewBg: "linear-gradient(180deg, oklch(0.94 0.035 265 / 0.75) 0%, oklch(0.89 0.065 258 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #12132b 0%, #0a0a1a 100%)",
      badge: "Written in the stars",
      tagline: "Cosmic dreams & galaxies",
      accentTextColor: "text-indigo-200",
      motifType: "celestial",
    },
  },

  ocean: {
    id: "ocean",
    label: "Good Wishes",
    tagline: "A sea of good wishes",
    emoji: "🌊",
    badgeText: "Sending Waves of Wishes",
    swatch: "bg-gradient-to-r from-[oklch(0.55_0.16_195)] via-[oklch(0.65_0.15_185)] to-[oklch(0.85_0.12_170)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.03 195) 0%, oklch(0.90 0.065 185) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.52 0.16 195) 0%, oklch(0.44 0.18 185) 60%, oklch(0.36 0.15 200) 100%)",
    lidColor: "oklch(0.38 0.17 190)",
    ribbonColor: "oklch(0.88 0.10 180)",
    bowKnotColor: "oklch(0.70 0.16 35)",
    haloGradient: "radial-gradient(circle, oklch(0.55 0.16 195 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.88 0.10 180 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.55 0.16 195)",
      "oklch(0.88 0.10 180)",
      "oklch(0.68 0.15 175)",
      "oklch(0.78 0.12 160)",
      "oklch(0.95 0.05 190)",
    ],
    confettiEmojis: ["🌊", "🫧", "🩵", "✨"],
    cardAccentBorder: "border-[oklch(0.55_0.16_195)]/30",
    accentText: "text-[oklch(0.44_0.18_185)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.50 0.16 198) 0%, oklch(0.42 0.17 185) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.52 0.15 190 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.95 0.035 192 / 0.75) 0%, oklch(0.905 0.06 185 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #d8f3ee 0%, #b3e7dd 100%)",
      badge: "A sea of good wishes.",
      tagline: "Calm tides and gentle dreams",
      accentTextColor: "text-teal-900",
      motifType: "waves",
    },
  },

  party: {
    id: "party",
    label: "Party",
    tagline: "Electric neon & fireworks",
    emoji: "🪩",
    badgeText: "Time to Celebrate!",
    swatch: "bg-gradient-to-r from-[oklch(0.60_0.26_330)] via-[oklch(0.55_0.24_300)] to-[oklch(0.88_0.20_110)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.035 325) 0%, oklch(0.90 0.075 305) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.58 0.25 330) 0%, oklch(0.50 0.24 300) 60%, oklch(0.42 0.22 280) 100%)",
    lidColor: "oklch(0.45 0.26 320)",
    ribbonColor: "oklch(0.88 0.20 110)",
    bowKnotColor: "oklch(0.72 0.22 80)",
    haloGradient: "radial-gradient(circle, oklch(0.60 0.26 330 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.88 0.20 110 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.60 0.26 330)",
      "oklch(0.88 0.20 110)",
      "oklch(0.70 0.22 220)",
      "oklch(0.75 0.22 25)",
      "oklch(0.95 0.08 90)",
    ],
    confettiEmojis: ["🪩", "🎆", "🕺", "⚡"],
    cardAccentBorder: "border-[oklch(0.60_0.26_330)]/30",
    accentText: "text-[oklch(0.50_0.24_300)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.55 0.26 330) 0%, oklch(0.46 0.25 300) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.56 0.22 315 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.95 0.04 320 / 0.75) 0%, oklch(0.905 0.07 302 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #2b0b3a 0%, #170420 100%)",
      badge: "LET'S CELEBRATE!",
      tagline: "Lights, music & joy",
      accentTextColor: "text-fuchsia-300",
      motifType: "disco",
    },
  },

  romance: {
    id: "romance",
    label: "Romance",
    tagline: "Warm candlelight & rose",
    emoji: "🌹",
    badgeText: "Forever & Always",
    swatch: "bg-gradient-to-r from-[oklch(0.42_0.22_15)] via-[oklch(0.48_0.20_25)] to-[oklch(0.82_0.14_75)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.025 22) 0%, oklch(0.90 0.055 15) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.42 0.22 15) 0%, oklch(0.35 0.20 20) 60%, oklch(0.28 0.18 10) 100%)",
    lidColor: "oklch(0.30 0.22 15)",
    ribbonColor: "oklch(0.82 0.14 75)",
    bowKnotColor: "oklch(0.68 0.18 50)",
    haloGradient: "radial-gradient(circle, oklch(0.48 0.22 20 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.82 0.14 75 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.45 0.22 15)",
      "oklch(0.82 0.14 75)",
      "oklch(0.65 0.18 25)",
      "oklch(0.72 0.16 350)",
      "oklch(0.92 0.08 75)",
    ],
    confettiEmojis: ["🌹", "🕯️", "💌", "❤️‍🔥"],
    cardAccentBorder: "border-[oklch(0.42_0.22_15)]/30",
    accentText: "text-[oklch(0.38_0.22_15)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.40 0.20 15) 0%, oklch(0.32 0.18 10) 60%, oklch(0.46 0.16 30) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.45 0.18 18 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.95 0.03 20 / 0.75) 0%, oklch(0.905 0.055 15 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #2e1216 0%, #1a080a 100%)",
      badge: "Wrapped with love",
      tagline: "From the bottom of my heart",
      accentTextColor: "text-amber-200",
      motifType: "candle",
    },
  },

  botanical: {
    id: "botanical",
    label: "Botanical",
    tagline: "Lush greenery & fresh bloom",
    emoji: "🌿",
    badgeText: "Growing Strong & Bright",
    swatch: "bg-gradient-to-r from-[oklch(0.50_0.16_140)] via-[oklch(0.58_0.15_130)] to-[oklch(0.85_0.12_40)]",
    bgGradient: "linear-gradient(180deg, oklch(0.965 0.025 135) 0%, oklch(0.905 0.06 128) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.48 0.16 140) 0%, oklch(0.40 0.17 135) 60%, oklch(0.32 0.15 145) 100%)",
    lidColor: "oklch(0.35 0.16 138)",
    ribbonColor: "oklch(0.85 0.12 40)",
    bowKnotColor: "oklch(0.70 0.15 50)",
    haloGradient: "radial-gradient(circle, oklch(0.52 0.16 140 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.85 0.12 40 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.50 0.16 140)",
      "oklch(0.85 0.12 40)",
      "oklch(0.68 0.16 130)",
      "oklch(0.78 0.14 70)",
      "oklch(0.92 0.08 110)",
    ],
    confettiEmojis: ["🌿", "🌸", "🍃", "🌼"],
    cardAccentBorder: "border-[oklch(0.50_0.16_140)]/30",
    accentText: "text-[oklch(0.40_0.17_135)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.46 0.16 142) 0%, oklch(0.38 0.16 132) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.50 0.15 136 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.955 0.03 135 / 0.75) 0%, oklch(0.91 0.055 128 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #e4f2e9 0%, #cce6d5 100%)",
      badge: "Bloom & flourish",
      tagline: "Rooted in love and wonder",
      accentTextColor: "text-emerald-950",
      motifType: "bloom",
    },
  },

  sunset: {
    id: "sunset",
    label: "Sunset",
    tagline: "Golden hour & dreamy vibes",
    emoji: "🌅",
    badgeText: "Golden Moments Ahead",
    swatch: "bg-gradient-to-r from-[oklch(0.62_0.20_40)] via-[oklch(0.58_0.22_25)] to-[oklch(0.78_0.12_300)]",
    bgGradient: "linear-gradient(180deg, oklch(0.97 0.03 48) 0%, oklch(0.91 0.07 30) 100%)",
    boxGradient: "linear-gradient(135deg, oklch(0.62 0.20 40) 0%, oklch(0.54 0.22 25) 60%, oklch(0.44 0.18 350) 100%)",
    lidColor: "oklch(0.46 0.22 30)",
    ribbonColor: "oklch(0.78 0.12 300)",
    bowKnotColor: "oklch(0.72 0.18 65)",
    haloGradient: "radial-gradient(circle, oklch(0.65 0.20 40 / 0.55) 0%, transparent 65%)",
    unwrapHaloGradient: "radial-gradient(circle, oklch(0.78 0.12 300 / 0.7) 0%, transparent 70%)",
    confettiColors: [
      "oklch(0.62 0.20 40)",
      "oklch(0.78 0.12 300)",
      "oklch(0.72 0.20 60)",
      "oklch(0.65 0.18 350)",
      "oklch(0.95 0.08 75)",
    ],
    confettiEmojis: ["🌅", "🌇", "🧡", "✨"],
    cardAccentBorder: "border-[oklch(0.62_0.20_40)]/30",
    accentText: "text-[oklch(0.46_0.21_25)]",
    buttonGradient: "linear-gradient(135deg, oklch(0.58 0.20 38) 0%, oklch(0.50 0.22 22) 60%, oklch(0.46 0.20 355) 100%)",
    buttonTextColor: "text-white",
    cardTint: "oklch(0.62 0.18 36 / 0.35)",
    previewBg: "linear-gradient(180deg, oklch(0.96 0.035 45 / 0.75) 0%, oklch(0.92 0.065 30 / 0.85) 100%)",
    drawerPreview: {
      bg: "linear-gradient(135deg, #fde4d8 0%, #fbd1c0 100%)",
      badge: "Chasing golden hours",
      tagline: "Warm memories that stay forever",
      accentTextColor: "text-amber-900",
      motifType: "horizon",
    },
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
