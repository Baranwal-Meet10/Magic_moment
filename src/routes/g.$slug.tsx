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
//   • RPC open failure → inline toast + Retry button. Raw error text is
//     never surfaced to the user — only a friendly message. The technical
//     detail is only kept in the console for the developer.
//   • Image sign failure → the photo is silently skipped so the message
//     is always readable.
// ---------------------------------------------------------------------------
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Gift, Lock, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type GiftRow = {
  slug: string;
  message: string;
  creator_name: string | null;
  theme: string;
  image_urls: string[];
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
};

export const Route = createFileRoute("/g/$slug")({
  component: RevealPage,
  loader: async ({ params }) => {
    // SECURITY DEFINER RPC. Table is not readable via Data API.
    const { data, error } = await supabase.rpc("get_gift_by_slug", {
      _slug: params.slug,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw notFound();
    return { gift: row as GiftRow };
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
    <div className="flex min-h-screen items-center justify-center px-4">
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
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold">We couldn't reach this gift.</h1>
        <p className="mt-3 text-muted-foreground">
          Check your connection and try again — nothing has been opened.
        </p>
        <button
          onClick={() => router.invalidate()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  );
}

function RevealPage() {
  const { gift } = Route.useLoaderData();
  const [opened, setOpened] = useState(gift.is_opened);
  const [unwrapping, setUnwrapping] = useState(false);
  const [signedImages, setSignedImages] = useState<string[]>([]);
  const [openError, setOpenError] = useState(false);

  // Lazily sign private-bucket URLs after open. Failure is non-fatal.
  useEffect(() => {
    if (!opened || !gift.image_urls?.length) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from("gift-images")
          .createSignedUrls(gift.image_urls, 60 * 60);
        if (cancelled) return;
        if (error) {
          console.warn("[reveal] image sign failed", error);
          return;
        }
        if (data) {
          setSignedImages(
            data.map((d) => d.signedUrl).filter((u): u is string => !!u),
          );
        }
      } catch (err) {
        console.warn("[reveal] image sign threw", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opened, gift.image_urls]);

  const unwrap = async () => {
    if (unwrapping || opened) return;
    setUnwrapping(true);
    setOpenError(false);

    // Race-safe flip. RPC returns true when THIS caller won the flip;
    // false is fine too — someone else opened it first, still show the message.
    const { error } = await supabase.rpc("open_gift", { _slug: gift.slug });

    if (error) {
      console.error("[reveal] open_gift failed", error);
      setUnwrapping(false);
      setOpenError(true);
      toast.error("Couldn't open the gift right now. Please try again.");
      return;
    }

    // Delay matches the lid-pop animation so the reveal feels continuous.
    setTimeout(() => setOpened(true), 900);
  };

  if (gift.is_opened && !unwrapping) {
    return <AlreadyOpened gift={gift} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Toaster position="top-center" richColors />
      {opened && <Confetti />}

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        {!opened ? (
          <>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {gift.creator_name ? `From ${gift.creator_name}` : "Someone sent you"}
            </p>
            <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              A gift for you.
            </h1>
            <p className="mb-12 text-muted-foreground">Tap the box to unwrap it.</p>

            <button
              onClick={unwrap}
              disabled={unwrapping}
              aria-label="Unwrap gift"
              className="group relative disabled:cursor-not-allowed"
            >
              <GiftBox unwrapping={unwrapping} />
              {unwrapping && <SparkleBurst />}
            </button>

            {openError ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <p className="text-sm text-destructive">
                  Something went wrong while unwrapping. Your gift is safe.
                </p>
                <button
                  onClick={unwrap}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              </div>
            ) : (
              <p className="mt-12 text-xs text-muted-foreground">
                This gift can only be opened once.
              </p>
            )}
          </>
        ) : (
          <div className="w-full animate-reveal-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Just for you
            </div>
            {gift.creator_name && (
              <p
                className="mb-2 animate-message-in text-sm font-medium uppercase tracking-widest text-muted-foreground"
                style={{ animationDelay: "0.5s" }}
              >
                From {gift.creator_name}
              </p>
            )}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-gift sm:p-12">
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
                {gift.message}
              </p>
            </div>

            <Link
              to="/create"
              className="mt-8 inline-flex animate-message-in items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-sm font-medium text-primary-foreground shadow-gift transition-transform hover:scale-[1.03]"
              style={{ animationDelay: "1.1s" }}
            >
              <Gift className="h-4 w-4" /> Send one of your own
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function GiftBox({ unwrapping }: { unwrapping: boolean }) {
  return (
    <div className="relative h-56 w-56 sm:h-72 sm:w-72">
      {/* Warm halo glow — only visible while idle */}
      {!unwrapping && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.18 30 / 0.55) 0%, transparent 65%)",
          }}
        />
      )}

      {/* Halo pulse fires once when tapped */}
      {unwrapping && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 animate-halo-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.80 0.14 85 / 0.7) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Box body */}
      <div
        className={`absolute inset-x-0 bottom-0 top-16 rounded-2xl bg-gradient-warm shadow-gift transition-transform ${
          !unwrapping ? "animate-box-shake animate-box-glow group-hover:animate-none" : ""
        }`}
      >
        {/* Vertical ribbon on the body */}
        <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 bg-[color:var(--gold)]/90" />
      </div>

      {/* Vertical ribbon on top of lid — flies off */}
      <div
        className={`absolute left-1/2 top-0 h-16 w-9 -translate-x-1/2 rounded-t-lg bg-[color:var(--gold)] ${
          unwrapping ? "animate-ribbon-fly" : ""
        }`}
      />

      {/* Lid */}
      <div
        className={`absolute inset-x-[-4%] top-8 h-20 rounded-xl bg-[oklch(0.55_0.22_15)] shadow-gift ${
          unwrapping ? "animate-lid-pop" : ""
        }`}
      >
        <div className="absolute left-1/2 top-0 h-full w-9 -translate-x-1/2 bg-[color:var(--gold)]" />
      </div>

      {/* Bow — flies with its own trajectory */}
      <div
        className={`absolute left-1/2 top-[-16px] -translate-x-1/2 ${
          unwrapping ? "animate-bow-fly" : ""
        }`}
      >
        <div className="relative h-10 w-16">
          <div className="absolute left-0 top-0 h-10 w-8 rounded-full bg-[color:var(--gold)] shadow-soft" />
          <div className="absolute right-0 top-0 h-10 w-8 rounded-full bg-[color:var(--gold)] shadow-soft" />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.18_75)]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Sparkle burst radiating from the box center on tap.
 * Each sparkle gets a random unit vector and slight delay for organic feel.
 */
function SparkleBurst() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.6;
        const distance = 120 + Math.random() * 60;
        return {
          sx: `${Math.cos(angle) * distance}px`,
          sy: `${Math.sin(angle) * distance}px`,
          delay: `${Math.random() * 0.15}s`,
          size: 6 + Math.floor(Math.random() * 8),
          color:
            i % 3 === 0
              ? "oklch(0.80 0.14 85)"
              : i % 3 === 1
                ? "oklch(0.72 0.17 25)"
                : "oklch(0.99 0.01 75)",
        };
      }),
    [],
  );
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

/**
 * Falling confetti with mixed shapes (rectangles, circles, thin ribbons)
 * and varied sizes for a richer feel than the Phase 1 uniform strips.
 */
function Confetti() {
  const pieces = useMemo(() => {
    const colors = [
      "oklch(0.72 0.17 25)",
      "oklch(0.80 0.14 85)",
      "oklch(0.66 0.20 15)",
      "oklch(0.65 0.15 150)",
      "oklch(0.62 0.20 350)",
      "oklch(0.85 0.12 200)",
    ];
    return Array.from({ length: 60 }).map((_, i) => {
      const shape = i % 3; // 0=rect, 1=circle, 2=thin ribbon
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
  }, []);

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
          }}
          className="absolute"
        />
      ))}
    </div>
  );
}

function AlreadyOpened({ gift }: { gift: GiftRow }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
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
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft"
        >
          <Gift className="h-4 w-4" /> Send your own
        </Link>
      </div>
    </main>
  );
}
