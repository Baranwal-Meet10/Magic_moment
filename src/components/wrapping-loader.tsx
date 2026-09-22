import * as React from "react";
import { Sparkles } from "lucide-react";
import loadingVideo from "@/assets/loading.mp4";

interface WrappingLoaderProps {
  statusText?: string;
  className?: string;
}

/**
 * WrappingLoaderOverlay:
 * Displays real-time loading feedback with the custom loading.mp4 video
 * after user taps "Wrap the gift" and before the link is generated.
 *
 * NOTE: The native video is 150x150. Display size is intentionally kept
 * compact (max 120px-128px) to prevent any pixel distortion or stretching.
 */
export function WrappingLoaderOverlay({
  statusText = "Wrapping your gift…",
  className = "",
}: WrappingLoaderProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    // Ensure muted autoplay succeeds across iOS Safari and Android Chrome WebViews
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay handled gracefully if prevented
        });
      }
    }
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Wrapping your gift"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md transition-all duration-300 ${className}`}
    >
      <div className="relative flex w-full max-w-xs flex-col items-center justify-center rounded-3xl border border-border/80 bg-card/95 p-6 text-center shadow-gift backdrop-blur-sm sm:p-8">
        {/* Subtle decorative glow */}
        <div
          className="pointer-events-none absolute -inset-1 -z-10 rounded-[28px] opacity-30 blur-xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.17 25 / 0.4) 0%, transparent 70%)",
          }}
        />

        {/* Video Wrapper — Sized strictly under 150px to keep pixels razor-sharp */}
        <div className="relative mb-5 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white p-2 shadow-soft sm:h-[130px] sm:w-[130px]">
          <video
            ref={videoRef}
            src={loadingVideo || "/loading.mp4"}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            width={130}
            height={130}
            className="h-full w-full object-contain mix-blend-multiply select-none pointer-events-none"
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Wrapping your gift…</span>
        </div>

        {/* Real-time status text */}
        <p className="mt-2 min-h-[1.25rem] text-xs font-medium text-muted-foreground transition-all duration-200">
          {statusText}
        </p>

        {/* Pulsing loading dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}
