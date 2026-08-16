// ---------------------------------------------------------------------------
// mobile-touch.tsx — Dedicated Mobile & Touch Interaction Components
// ---------------------------------------------------------------------------
// Provides touch-optimized UI components for mobile browsers (iOS Safari,
// Android Chrome, in-app WebViews like Instagram / WhatsApp / Telegram).
//
// Key optimizations:
// 1. Touch targets >= 48px to prevent missed taps.
// 2. `touch-action: manipulation` eliminates the 300ms double-tap zoom delay.
// 3. Hardware-accelerated CSS animations with pointer-events isolation so
//    transforming layers never steal tap events on iOS Safari.
// 4. Reliable event dispatching without event swallowing or tap blocking.
// ---------------------------------------------------------------------------
import * as React from "react";
import { cn } from "@/lib/utils";
import { getThemeConfig, type ThemeId } from "@/lib/theme";

export type MobileButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * MobileButton: Touch-friendly button with instant visual feedback,
 * 48px+ touch padding, non-blocking click handler, and tap-highlight removal.
 */
export const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, style, onClick, disabled, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled}
        onClick={handleClick}
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
          outline: "none",
          ...style,
        }}
        className={cn(
          "min-h-[48px] touch-manipulation select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-transform duration-100 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none",
          className
        )}
      >
        {children}
      </button>
    );
  }
);
MobileButton.displayName = "MobileButton";

/**
 * Custom hook to detect if current device is a mobile/touch device or viewport <= 640px.
 */
export function useMobileTouch() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth <= 640;
      setIsMobile(hasTouch || isSmall);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

interface MobileGiftBoxProps {
  themeId?: ThemeId | string;
  unwrapping: boolean;
  onTap?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * MobileGiftBox: High-performance, theme-aware interactive 3D gift box.
 * Designed for mobile touch screens with clear tap targets, pointer-events isolation,
 * and hardware acceleration to work smoothly under heavy user load.
 */
export function MobileGiftBox({
  themeId,
  unwrapping,
  onTap,
  disabled,
  className,
}: MobileGiftBoxProps) {
  const theme = getThemeConfig(themeId);
  const lastTap = React.useRef(0);

  const handleTap = (e: React.SyntheticEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 350) return;
    lastTap.current = now;
    if (disabled || unwrapping) return;
    onTap?.();
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      onTouchEnd={(e) => {
        if (!disabled && !unwrapping) {
          e.preventDefault();
          handleTap(e);
        }
      }}
      disabled={disabled || unwrapping}
      aria-label={`Unwrap gift (${theme.label} theme)`}
      style={{
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        outline: "none",
      }}
      className={cn(
        "relative z-10 mx-auto block cursor-pointer select-none p-4 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ring-0 border-none rounded-3xl transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-80",
        className
      )}
    >
      <div className="pointer-events-none relative h-56 w-56 sm:h-72 sm:w-72">
        {/* Halo Glow */}
        {!unwrapping && (
          <div
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] animate-glow-pulse rounded-full blur-xl sm:blur-2xl"
            style={{ background: theme.haloGradient }}
          />
        )}

        {unwrapping && (
          <div
            className="absolute left-1/2 top-1/2 h-40 w-40 animate-halo-pulse rounded-full"
            style={{ background: theme.unwrapHaloGradient }}
          />
        )}

        {/* Gift Box Base */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 top-16 rounded-2xl shadow-gift transition-colors duration-300",
            !unwrapping ? "animate-box-shake" : ""
          )}
          style={{ background: theme.boxGradient }}
        >
          {/* Vertical Ribbon */}
          <div
            className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 opacity-95"
            style={{ backgroundColor: theme.ribbonColor }}
          />
        </div>

        {/* Ribbon Lid Tail */}
        <div
          className={cn(
            "absolute left-1/2 top-0 h-16 w-9 -translate-x-1/2 rounded-t-lg opacity-95",
            unwrapping ? "animate-ribbon-fly" : ""
          )}
          style={{ backgroundColor: theme.ribbonColor }}
        />

        {/* Gift Box Lid */}
        <div
          className={cn(
            "absolute inset-x-[-4%] top-8 h-20 rounded-xl shadow-gift",
            unwrapping ? "animate-lid-pop" : ""
          )}
          style={{ backgroundColor: theme.lidColor }}
        >
          <div
            className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 opacity-95"
            style={{ backgroundColor: theme.ribbonColor }}
          />
        </div>

        {/* Gift Bow */}
        <div
          className={cn(
            "absolute left-1/2 top-[-16px] -translate-x-1/2",
            unwrapping ? "animate-bow-fly" : ""
          )}
        >
          <div className="relative h-10 w-16">
            <div
              className="absolute left-0 top-0 h-10 w-8 rounded-full shadow-soft"
              style={{ backgroundColor: theme.ribbonColor }}
            />
            <div
              className="absolute right-0 top-0 h-10 w-8 rounded-full shadow-soft"
              style={{ backgroundColor: theme.ribbonColor }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-inner"
              style={{ backgroundColor: theme.bowKnotColor }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
