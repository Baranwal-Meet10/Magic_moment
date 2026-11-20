// ---------------------------------------------------------------------------
// theme-drawer.tsx — Right-Side Slide-Over Theme Selection Drawer
// ---------------------------------------------------------------------------
// Replicates the 12-theme visual mood selector matching the GiftLink design.
// Features:
//   - Radix Sheet side="right" responsive slide-over panel
//   - Rich illustrated preview card banners for all 12 mood themes
//   - Instant live selection feedback
//   - Accessible keyboard & touch interaction
//   - Sticky header & footer with "Done" action
// ---------------------------------------------------------------------------

import * as React from "react";
import { X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/sheet";
import { THEMES, type ThemeId, type ThemeConfig } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface ThemeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

/**
 * Visual illustration banners matching the card header aesthetics in the design mockup.
 */
function ThemeCardBanner({ theme }: { theme: ThemeConfig }) {
  switch (theme.drawerPreview.motifType) {
    case "giftbox":
      return (
        <div
          className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-t-xl"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Subtle live preview tag */}
          <div className="absolute top-1.5 flex items-center gap-1 text-[9px] font-medium text-amber-900/60">
            <span>Live Preview</span>
            <span className="font-semibold">{theme.label} Theme</span>
            <span>({theme.emoji})</span>
          </div>

          {/* Mini 3D styled box preview */}
          <div className="relative mt-2 h-14 w-16">
            {/* Box Body */}
            <div
              className="absolute inset-x-0 bottom-0 h-11 rounded-lg shadow-sm"
              style={{ background: theme.boxGradient }}
            >
              {/* Vertical Ribbon */}
              <div
                className="absolute left-1/2 top-0 h-full w-2.5 -translate-x-1/2"
                style={{ backgroundColor: theme.ribbonColor }}
              />
            </div>
            {/* Box Lid */}
            <div
              className="absolute inset-x-[-2px] top-1 h-4 rounded-md shadow-sm"
              style={{ backgroundColor: theme.lidColor }}
            >
              <div
                className="absolute left-1/2 top-0 h-full w-2.5 -translate-x-1/2"
                style={{ backgroundColor: theme.ribbonColor }}
              />
            </div>
            {/* Bow knot */}
            <div className="absolute left-1/2 top-[-4px] -translate-x-1/2">
              <div
                className="h-2 w-4 rounded-full shadow-inner"
                style={{ backgroundColor: theme.ribbonColor }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: theme.bowKnotColor }}
              />
            </div>
          </div>
        </div>
      );

    case "envelope":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          <span className="text-[9px] font-medium italic tracking-wide text-rose-900/70">
            A little love, wrapped up
          </span>
          {/* Envelope Graphic */}
          <div className="relative my-1 flex h-9 w-16 items-center justify-center rounded-sm bg-rose-200/90 shadow-sm border border-rose-300/60">
            {/* Flap triangle */}
            <div className="absolute top-0 h-0 w-0 border-x-[32px] border-x-transparent border-t-[18px] border-t-rose-300/80" />
            {/* Heart seal */}
            <div className="z-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] text-white shadow-xs">
              ❤️
            </div>
            {/* Floating little hearts */}
            <span className="absolute -left-2 top-0 text-[10px] opacity-80">❤️</span>
            <span className="absolute -right-2 bottom-1 text-[9px] opacity-80">❤️</span>
          </div>
          <span className="text-[8px] font-medium tracking-wider text-rose-900/60 uppercase">
            Just for you
          </span>
        </div>
      );

    case "note":
      return (
        <div
          className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-t-xl px-3"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Botanical leaf decorations on left & right */}
          <span className="absolute left-1.5 text-base text-emerald-800/60">🌿</span>
          <span className="absolute right-1.5 text-base text-emerald-800/60">🌿</span>

          {/* White Paper Note Card */}
          <div className="flex h-14 w-24 -rotate-1 flex-col items-center justify-center rounded-md border border-emerald-900/10 bg-white/95 px-2 py-1 shadow-sm">
            <span className="font-serif text-xs font-semibold tracking-tight text-emerald-950">
              Thank
            </span>
            <span className="font-serif text-xs font-semibold tracking-tight text-emerald-950 -mt-1">
              you.
            </span>
            <span className="mt-0.5 text-[6px] tracking-wider text-emerald-900/60 uppercase">
              A SMALL NOTE OF BIG GRATITUDE
            </span>
          </div>
        </div>
      );

    case "tree":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl"
          style={{ background: theme.drawerPreview.bg }}
        >
          <span className="text-[8px] font-medium tracking-widest text-emerald-200/70 uppercase">
            merry & bright
          </span>
          {/* Christmas Tree Illustration */}
          <div className="relative my-0.5 flex flex-col items-center">
            {/* Star Topper */}
            <span className="text-[10px] text-amber-300">★</span>
            {/* Geometric tree tier 1 */}
            <div className="h-0 w-0 border-x-[12px] border-x-transparent border-b-[14px] border-b-emerald-600 -mt-1" />
            {/* Tier 2 */}
            <div className="h-0 w-0 border-x-[16px] border-x-transparent border-b-[16px] border-b-emerald-700 -mt-2" />
            {/* Trunk */}
            <div className="h-2 w-2 bg-amber-900/80 rounded-xs" />
          </div>
          {/* Sparkling dots */}
          <span className="absolute left-3 top-4 text-[8px] text-amber-200/80">✦</span>
          <span className="absolute right-4 top-6 text-[7px] text-amber-200/70">✦</span>
          <span className="font-serif text-[10px] font-medium tracking-wide text-emerald-200">
            Holiday magic
          </span>
        </div>
      );

    case "arches":
      return (
        <div
          className="relative flex h-24 w-full items-center justify-between overflow-hidden rounded-t-xl px-4"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Left Text */}
          <div className="flex flex-col text-left">
            <span className="font-serif text-xs font-semibold text-amber-950">
              Hello,
            </span>
            <span className="font-serif text-xs font-semibold text-amber-950 -mt-1">
              there.
            </span>
            <span className="mt-1 text-[6px] tracking-wider text-amber-900/60 uppercase">
              A WARM WELCOME AWAITS
            </span>
          </div>

          {/* Sun & Arches Right Graphic */}
          <div className="relative flex flex-col items-center">
            {/* Golden Sun */}
            <div className="mb-0.5 h-3.5 w-3.5 rounded-full bg-amber-400 shadow-xs" />
            {/* Concentric Arches */}
            <div className="flex h-10 w-9 items-end justify-center rounded-t-full border-t-4 border-x-4 border-amber-600/80 bg-transparent px-1">
              <div className="h-7 w-6 rounded-t-full border-t-3 border-x-3 border-emerald-700/60 bg-transparent" />
            </div>
          </div>
        </div>
      );

    case "golden-banner":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Star sparkles */}
          <span className="absolute left-2.5 top-2 text-[10px] text-amber-300">✦</span>
          <span className="absolute right-3 bottom-2 text-[9px] text-amber-300">✦</span>

          <div className="flex items-center gap-1 text-center">
            <span className="text-xs text-amber-300">✦</span>
            <span className="font-display text-sm font-extrabold tracking-wider text-white">
              YOU DID IT!
            </span>
            <span className="text-xs text-amber-300">✦</span>
          </div>

          <span className="mt-1 text-[8px] font-medium tracking-wide text-amber-200/80">
            A celebration for a big moment.
          </span>
          <span className="text-[6px] tracking-widest text-amber-300/50 uppercase mt-0.5">
            CONGRATULATIONS
          </span>
        </div>
      );

    case "celestial":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Twinkling star field */}
          <span className="absolute left-3 top-3 text-[7px] text-indigo-300/80">✦</span>
          <span className="absolute right-4 top-2 text-[8px] text-indigo-200/90">★</span>
          <span className="absolute left-6 bottom-3 text-[6px] text-indigo-400">✦</span>

          {/* Ringed Planet Graphic */}
          <div className="relative my-0.5 flex items-center justify-center">
            {/* Planet sphere */}
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-400 to-indigo-300 shadow-sm" />
            {/* Planetary Ring */}
            <div className="absolute h-2.5 w-12 rotate-[-25deg] rounded-full border border-indigo-200/70" />
            {/* Tiny orbiting moon */}
            <div className="absolute -right-3 -top-1 h-1.5 w-1.5 rounded-full bg-purple-200" />
          </div>

          <span className="font-serif text-[9px] tracking-wide text-indigo-200">
            Written in the stars
          </span>
        </div>
      );

    case "waves":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-3 text-center"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Decorative Teal Medallion */}
          <div className="mb-1 text-xs text-teal-800">
            ☸
          </div>

          <span className="font-serif text-xs font-semibold tracking-tight text-teal-950">
            A sea of
          </span>
          <span className="font-serif text-xs font-semibold tracking-tight text-teal-950 -mt-1">
            good wishes.
          </span>

          {/* Undulating Wave Graphics at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-4 opacity-50">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-full w-full fill-teal-600/30">
              <path d="M0,10 C30,20 70,0 100,10 L100,20 L0,20 Z" />
            </svg>
          </div>
        </div>
      );

    case "disco":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Laser light streaks */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-500/20 via-transparent to-transparent" />
          <span className="absolute left-3 top-2 text-[8px] text-pink-400">⚡</span>
          <span className="absolute right-3 top-3 text-[9px] text-yellow-300">✦</span>

          {/* Disco ball graphic */}
          <div className="relative my-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-gray-200 to-gray-400 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-0.5 text-[6px] opacity-75">
              <span>▫</span><span>▫</span><span>▫</span>
            </div>
          </div>

          <span className="font-display text-[10px] font-black tracking-wider text-fuchsia-300">
            LET'S CELEBRATE!
          </span>
          <span className="text-[7px] text-fuchsia-200/70">
            Lights, music & joy
          </span>
        </div>
      );

    case "candle":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          <span className="absolute left-3 top-3 text-[9px] text-rose-400/80">🥀</span>
          <span className="absolute right-3 bottom-2 text-[9px] text-amber-400/80">✨</span>

          {/* Candle Flame & glow */}
          <div className="relative my-0.5 flex flex-col items-center">
            <div className="h-2.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <div className="h-5 w-2 rounded-t-sm bg-rose-200/90 -mt-0.5" />
          </div>

          <span className="font-serif text-[10px] font-medium tracking-wide text-amber-200">
            Wrapped with love
          </span>
          <span className="text-[7px] text-amber-200/60">
            From the bottom of my heart
          </span>
        </div>
      );

    case "bloom":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2"
          style={{ background: theme.drawerPreview.bg }}
        >
          <span className="absolute left-2 top-2 text-[10px] text-emerald-700/80">🌿</span>
          <span className="absolute right-2 top-2 text-[10px] text-emerald-700/80">🌸</span>

          <span className="font-serif text-xs font-semibold text-emerald-950">
            Bloom & flourish
          </span>
          <span className="text-[8px] font-medium text-emerald-900/70 mt-0.5">
            Rooted in love and wonder
          </span>
          <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-800/80">
            <span>🌱</span><span>❀</span><span>🌱</span>
          </div>
        </div>
      );

    case "horizon":
      return (
        <div
          className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-t-xl px-2 text-center"
          style={{ background: theme.drawerPreview.bg }}
        >
          {/* Half sun setting over horizon */}
          <div className="relative my-0.5 flex flex-col items-center">
            <div className="h-4 w-8 rounded-t-full bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm" />
            <div className="h-[1px] w-14 bg-amber-800/40" />
          </div>

          <span className="font-serif text-[10px] font-semibold text-amber-950 mt-0.5">
            Chasing golden hours
          </span>
          <span className="text-[7px] text-amber-900/70">
            Warm memories that stay forever
          </span>
        </div>
      );

    default:
      return (
        <div
          className="flex h-24 w-full items-center justify-center rounded-t-xl text-2xl"
          style={{ background: theme.drawerPreview.bg }}
        >
          {theme.emoji}
        </div>
      );
  }
}

/**
 * Slide-over right-side Theme Drawer component
 */
export function ThemeDrawer({
  open,
  onOpenChange,
  selectedTheme,
  onSelectTheme,
}: ThemeDrawerProps) {
  const themeList = React.useMemo(() => Object.values(THEMES), []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-[95vw] sm:max-w-[480px] flex-col gap-0 p-0 shadow-2xl focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="border-b border-border/70 bg-card/60 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#9e4438]">
                Make it their kind of special
              </span>
              <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-[#3b1d19]">
                Choose a theme
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                12 different moods. One thoughtful gift.
              </SheetDescription>
              <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 pt-0.5">
                Scroll to explore every style ↓
              </p>
            </div>

            {/* Styled Close Button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close theme drawer"
              className="rounded-full bg-secondary/80 p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable 2-Column Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3.5 pb-4">
            {themeList.map((theme) => {
              const isSelected = selectedTheme === theme.id;

              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  style={{ touchAction: "manipulation" }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSelected
                      ? "border-[#b8336a] bg-card ring-2 ring-[#b8336a]/30 shadow-md"
                      : "border-border/80 bg-card hover:border-border hover:shadow-xs"
                  )}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#b8336a] text-white shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Visual Preview Illustration Banner */}
                  <ThemeCardBanner theme={theme} />

                  {/* Card Label & Tagline */}
                  <div className="flex flex-col p-3">
                    <span className="font-display text-sm font-bold text-foreground">
                      {theme.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                      {theme.tagline}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-border/70 bg-card/90 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full bg-[#b8336a] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a22b5c] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#b8336a] focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
