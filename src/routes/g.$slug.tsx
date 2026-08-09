// ---------------------------------------------------------------------------
// /g/:slug — Gift reveal page
// ---------------------------------------------------------------------------
// Phase 2 reveal choreography:
//   Idle box (subtle shake + warm glow halo) → tap → lid pops, ribbon &
//   bow fly upward, sparkle burst radiates, confetti falls, then the
//   message rises with a staggered blur-in. All animations respect
//   `prefers-reduced-motion` (see styles.css).
//
// Errors:
//   • Loader failure → errorComponent (retry via router.invalidate).
//   • RPC open failure → inline toast + Retry button. Safe non-leaking message.
//   • Image sign failure → photo skipped gracefully.
// ---------------------------------------------------------------------------
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { Gift, Lock, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getGiftImageUrls } from "@/lib/gift-images.functions";
import { getThemeConfig } from "@/lib/theme";
import { MobileGiftBox, MobileButton } from "@/components/mobile-touch";

type GiftMeta = {
  slug: string;
  creator_name: string | null;
  theme: string;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  has_images: boolean;
};

export const Route = createFileRoute("/g/$slug")({
  component: RevealPage,
  loader: async ({ params }) => {
    // SECURITY DEFINER RPC. Returns metadata only — never the message.
    const { data, error } = await supabase.rpc("get_gift_by_slug", {
      _slug: params.slug,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw notFound();
    return { gift: row as unknown as GiftMeta };
  },

  head: ({ loaderData }) => ({
    meta: loaderData?.gift
      ? [
          {
            title: loaderData.gift.creator_name
              ? `A gift from ${loaderData.gift.creator_name} · GiftLink`
              : "You have a gift · GiftLink",
          },
          { name: "description", content: "Tap to unwrap your GiftLink." },
          {
            property: "og:title",
            content: loaderData.gift.creator_name
              ? `A gift from ${loaderData.gift.creator_name}`
              : "You have a gift",
          },
          { property: "og:description", content: "Tap to unwrap it." },
          { name: "robots", content: "noindex" },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl font-semibold">This gift doesn't exist.</h1>
        <p className="mt-3 text-muted-foreground">
          The link may be mistyped or the gift was never created.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft"
        >
          Send your own gift
        </Link>
      </div>
    </div>
  ),
  errorComponent: LoaderError,
});

function LoaderError() {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold">We couldn't reach this gift.</h1>
        <p className="mt-3 text-muted-foreground">
          Check your connection and try again — nothing has been opened.
        </p>
        <MobileButton
          onClick={() => router.invalidate()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </MobileButton>
      </div>
    </div>
  );
}

function RevealPage() {
  const { gift } = Route.useLoaderData();
  const themeConfig = useMemo(() => getThemeConfig(gift.theme), [gift.theme]);

  const [opened, setOpened] = useState(gift.is_opened);
  const [unwrapping, setUnwrapping] = useState(false);
  const [signedImages, setSignedImages] = useState<string[]>([]);
  const [openError, setOpenError] = useState(false);

  // Sync lock so multiple taps or network delays can't double-call open_gift.
  const unwrapLock = useRef(false);

  const [revealed, setRevealed] = useState<{
    message: string;
    image_urls: string[];
  } | null>(null);

  useEffect(() => {
    if (!opened || !revealed?.image_urls?.length) return;
    let cancelled = false;
    (async () => {
      try {
        const { urls } = await getGiftImageUrls({ data: { slug: gift.slug } });
        if (!cancelled) setSignedImages(urls);
      } catch (err) {
        console.warn("[reveal] image sign failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opened, revealed, gift.slug]);

  const unwrap = async () => {
    if (unwrapLock.current || unwrapping || opened) return;
    unwrapLock.current = true;
    setUnwrapping(true);
    setOpenError(false);

    try {
      const { data, error } = await supabase.rpc("open_gift", { _slug: gift.slug });

      if (error) {
        console.error("[reveal] open_gift failed", error);
        unwrapLock.current = false;
        setUnwrapping(false);
        setOpenError(true);
        toast.error("Couldn't open the gift right now. Please try again.");
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.was_opened || !row?.message) {
        unwrapLock.current = false;
        setUnwrapping(false);
        toast.info("This gift was just opened somewhere else.");
        window.location.reload();
        return;
      }

      setRevealed({ message: row.message, image_urls: row.image_urls ?? [] });
      setTimeout(() => setOpened(true), 900);
    } catch (err) {
      console.error("[reveal] unexpected error", err);
      unwrapLock.current = false;
      setUnwrapping(false);
      setOpenError(true);
      toast.error("Network issue. Please tap again.");
    }
  };

  if (gift.is_opened && !unwrapping) {
    return <AlreadyOpened gift={gift} themeId={gift.theme} />;
  }

  return (
    <main
      className="relative min-h-dvh overflow-x-hidden transition-colors duration-500"
      style={{ background: themeConfig.bgGradient }}
    >
      <Toaster position="top-center" richColors />
      {opened && <Confetti colors={themeConfig.confettiColors} />}

      <div
        className={`mx-auto flex min-h-dvh max-w-2xl flex-col items-center px-6 py-16 text-center ${
          opened ? "justify-start sm:justify-center" : "justify-center"
        }`}
      >
        {!opened ? (
          <>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {gift.creator_name ? `From ${gift.creator_name}` : "Someone sent you"}
            </p>

            <h1 className="mb-2 font-display text-4xl font-bold tracking-tight sm:text-6xl">
              A gift for you {themeConfig.emoji}
            </h1>

            <p className="mb-10 text-muted-foreground font-medium">
              Tap the gift box below to unwrap it.
            </p>

            {/* Mobile Touch Optimized Interactive Gift Box */}
            <div className="relative">
              <MobileGiftBox
                themeId={gift.theme}
                unwrapping={unwrapping}
                onTap={unwrap}
                disabled={unwrapping}
              />
              {unwrapping && <SparkleBurst colors={themeConfig.confettiColors} />}
            </div>

            {openError ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <p className="text-sm text-destructive">
                  Something went wrong while unwrapping. Your gift is safe.
                </p>
                <MobileButton
                  onClick={unwrap}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft"
                >
                  <RefreshCw className="h-4 w-4" /> Tap to try again
                </MobileButton>
              </div>
            ) : (
              <p className="mt-12 text-xs text-muted-foreground">
                This gift can only be opened once.
              </p>
            )}
          </>
        ) : (
          <div className="w-full animate-reveal-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-4 py-1.5 text-xs font-semibold shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {themeConfig.badgeText} {themeConfig.emoji}
            </div>

            {gift.creator_name && (
              <p
                className="mb-2 animate-message-in text-sm font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ animationDelay: "0.5s" }}
              >
                From {gift.creator_name}
              </p>
            )}

            <div className={`rounded-3xl border ${themeConfig.cardAccentBorder} bg-card p-8 shadow-gift sm:p-12`}>
              {signedImages[0] && (
                <img
                  src={signedImages[0]}
                  alt="Gift"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                  className="mx-auto mb-6 max-h-96 w-full animate-message-in rounded-2xl object-cover"
                  style={{ animationDelay: "0.6s" }}
                />
              )}
              <p
                className="animate-message-in whitespace-pre-wrap font-display text-2xl leading-relaxed text-foreground sm:text-3xl"
                style={{ animationDelay: "0.8s" }}
              >
                {revealed?.message}
              </p>
            </div>

            <Link
              to="/create"
              className="mt-8 inline-flex animate-message-in items-center gap-2 rounded-full bg-gradient-warm px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gift transition-transform hover:scale-[1.03]"
              style={{ animationDelay: "1.1s" }}
            >
              <Gift className="h-4 w-4" /> Create & send your own gift
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

/** Sparkle burst radiating from box center */
function SparkleBurst({ colors }: { colors: string[] }) {
  const sparkles = useMemo(() => {
    const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
    const count = isSmall ? 10 : 16;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 120 + Math.random() * 60;
      return {
        sx: `${Math.cos(angle) * distance}px`,
        sy: `${Math.sin(angle) * distance}px`,
        delay: `${Math.random() * 0.15}s`,
        size: 6 + Math.floor(Math.random() * 8),
        color: colors[i % colors.length],
      };
    });
  }, [colors]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={
            {
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              "--sx": s.sx,
              "--sy": s.sy,
              animation: `sparkle-burst 0.9s ease-out ${s.delay} forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Confetti particles with dynamic palette & mobile GPU optimization */
function Confetti({ colors }: { colors: string[] }) {
  const [done, setDone] = useState(false);

  const pieces = useMemo(() => {
    const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
    const count = isSmall ? 24 : 50;
    return Array.from({ length: count }).map((_, i) => {
      const shape = i % 3;
      const width = shape === 2 ? 3 : 6 + Math.random() * 8;
      const height = shape === 2 ? 18 + Math.random() * 10 : shape === 1 ? width : 10 + Math.random() * 10;
      return {
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2.5,
        color: colors[i % colors.length],
        width,
        height,
        radius: shape === 1 ? "9999px" : "2px",
      };
    });
  }, [colors]);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 6000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            width: p.width,
            height: p.height,
            top: -20,
            borderRadius: p.radius,
            willChange: "transform, opacity",
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

function AlreadyOpened({ gift, themeId }: { gift: GiftMeta; themeId: string }) {
  const themeConfig = getThemeConfig(themeId);
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-6"
      style={{ background: themeConfig.bgGradient }}
    >
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold">This gift has been opened.</h1>
        <p className="mt-3 text-muted-foreground">
          {gift.creator_name ? `${gift.creator_name}'s` : "This"} gift can only be unwrapped once —
          and that moment already happened
          {gift.opened_at ? ` on ${new Date(gift.opened_at).toLocaleDateString()}` : ""}.
        </p>
        <Link
          to="/create"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          <Gift className="h-4 w-4" /> Send your own gift
        </Link>
      </div>
    </main>
  );
}
