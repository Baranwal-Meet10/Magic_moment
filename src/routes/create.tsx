// ---------------------------------------------------------------------------
// /create — Gift authoring flow
// ---------------------------------------------------------------------------
// Two screens rendered from this route:
//   1. CreatePage    — form: message, optional name, theme selection & live box preview, optional photo.
//   2. CreatedScreen — success view with the shareable /g/:slug URL.
//
// Data path:
//   photo (optional) → storage bucket `gift-images` at `<slug>/<uuid>.<ext>`
//   row              → `gifts` table. image_urls stores the storage PATH,
//                      not a public URL — reveal page signs it on demand.
// ---------------------------------------------------------------------------
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Gift, ArrowLeft, Image as ImageIcon, Loader2, Check, Copy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { THEMES, getThemeConfig, type ThemeId } from "@/lib/theme";
import { MobileButton, MobileGiftBox } from "@/components/mobile-touch";
import { logDevError, parseSupabaseError } from "@/lib/dev-logger";

export const Route = createFileRoute("/create")({
  component: CreatePage,
  head: () => ({
    meta: [
      { title: "Create a gift · GiftLink" },
      {
        name: "description",
        content: "Write a message, pick a beautiful theme, add a photo, and get a private link to share.",
      },
    ],
  }),
});

// Upload constraints — mirrored in the storage bucket policy.
const MAX_MB = 5;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/** Safe UUID helper that works on HTTPS, HTTP local IPs (192.168.x.x), and older mobile webviews */
function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "u" + Math.random().toString(36).slice(2, 11) + "-" + Date.now().toString(36);
}

function generateSlug(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  return "g-" + safeUUID().slice(0, 14);
}

function CreatePage() {
  const navigate = useNavigate();
  // --- Form state ---------------------------------------------------------
  const [message, setMessage] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [theme, setTheme] = useState<ThemeId>("birthday");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // --- Submit state & synchronous submission lock -------------------------
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const selectedThemeConfig = getThemeConfig(theme);

  // Validate + preview a selected file. Passing null clears the selection.
  const onFile = (f: File | null) => {
    if (!f) {
      setImageFile(null);
      setPreview(null);
      return;
    }
    if (!ACCEPT.includes(f.type)) {
      toast.error("Please upload a JPG, PNG, or WebP.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`Max file size is ${MAX_MB}MB.`);
      return;
    }
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Create the gift: upload photo (if any), then insert the row via SECURITY DEFINER RPC.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Synchronous double-submit lock to prevent rapid double-clicks
    if (submittingRef.current || submitting) return;

    if (!message.trim()) {
      toast.error("Add a message first.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    let uploadedPath: string | null = null;

    try {
      let imageUrls: string[] = [];

      // 1. Upload image to Supabase Storage bucket under a randomized path.
      if (imageFile) {
        const rawExt = (imageFile.name.split(".").pop() ?? "jpg").toLowerCase();
        const ext = ["jpg", "jpeg", "png", "webp"].includes(rawExt) ? rawExt : "jpg";
        uploadedPath = `uploads/${safeUUID()}.${ext}`;

        const { data: upData, error: upErr } = await supabase.storage
          .from("gift-images")
          .upload(uploadedPath, imageFile, { contentType: imageFile.type, upsert: false });

        if (upErr) {
          logDevError("create.tsx -> storage.upload", upErr);
          const parsed = parseSupabaseError(upErr, "Photo upload failed. Please try again.");
          toast.error(parsed.userMessage);
          // HALT EXECUTION: Do NOT create the gift if photo upload failed!
          return;
        }

        if (upData?.path) {
          uploadedPath = upData.path;
        }
        imageUrls = [uploadedPath];
      }

      // 2. Insert gift row via SECURITY DEFINER RPC (slug generated server-side).
      const { data, error } = await supabase.rpc("create_gift", {
        _message: message.trim(),
        _creator_name: creatorName.trim() || "",
        _theme: theme,
        _image_urls: imageUrls,
      });

      if (error) {
        logDevError("create.tsx -> rpc.create_gift", error);
        // Clean up orphaned storage object if RPC creation failed
        if (uploadedPath) {
          await supabase.storage
            .from("gift-images")
            .remove([uploadedPath])
            .catch((cleanupErr) => logDevError("create.tsx -> storage.remove orphan", cleanupErr));
        }
        const parsed = parseSupabaseError(error, "Couldn't create the gift. Please try again.");
        toast.error(parsed.userMessage);
        return;
      }

      if (!data || typeof data !== "string") {
        throw new Error("Invalid response from server");
      }

      setCreatedSlug(data);
    } catch (err) {
      logDevError("create.tsx -> submit exception", err);
      const parsed = parseSupabaseError(err, "Couldn't create the gift. Please try again.");
      toast.error(parsed.userMessage);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (createdSlug) {
    return (
      <CreatedScreen
        slug={createdSlug}
        onNew={() => {
          setCreatedSlug(null);
          setMessage("");
          setCreatorName("");
          setImageFile(null);
          setPreview(null);
        }}
        onOpen={() => navigate({ to: "/g/$slug", params: { slug: createdSlug } })}
      />
    );
  }

  const themeList = Object.values(THEMES);

  return (
    <main className="min-h-dvh transition-colors duration-500" style={{ background: selectedThemeConfig.bgGradient }}>
      <Toaster position="top-center" richColors />
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <Gift className="h-5 w-5 text-primary" /> GiftLink
        </div>
      </nav>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Wrap your gift</h1>
          <p className="mt-3 text-muted-foreground">
            Write a message, pick a theme, and send a private link they'll unwrap.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-medium">From (optional)</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Your message <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your special message here..."
              rows={5}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/1000
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">Choose Theme</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-2">
              {themeList.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{ touchAction: "manipulation" }}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 transition active:scale-[0.97] ${theme === t.id
                      ? "border-primary bg-secondary shadow-sm"
                      : "border-border bg-background hover:border-input"
                    }`}
                >
                  <div className={`h-7 w-7 rounded-full shadow-inner ${t.swatch} flex items-center justify-center text-xs`}>
                    {t.emoji}
                  </div>
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Gift Box Theme Preview */}
          <div className="rounded-2xl border border-border/80 bg-secondary/50 p-4 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Live Preview: {selectedThemeConfig.label} Theme ({selectedThemeConfig.emoji})
            </div>
            <MobileGiftBox themeId={theme} unwrapping={false} className="scale-90 sm:scale-100 -my-4" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Photo (optional)</label>
            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img src={preview} alt="Preview" className="max-h-72 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onFile(null)}
                  className="absolute right-2 top-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-soft"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
                <ImageIcon className="h-6 w-6" />
                <span>Tap to add a photo</span>
                <span className="text-xs">JPG, PNG, WebP · up to {MAX_MB}MB</span>
                <input
                  type="file"
                  accept={ACCEPT.join(",")}
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <MobileButton
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-warm py-4 text-base font-semibold text-primary-foreground shadow-gift transition-transform hover:scale-[1.02]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Wrapping gift…
              </>
            ) : (
              <>
                <Gift className="h-5 w-5" /> Wrap the gift & get link
              </>
            )}
          </MobileButton>
        </form>
      </section>
    </main>
  );
}

function CreatedScreen({
  slug,
  onNew,
  onOpen,
}: {
  slug: string;
  onNew: () => void;
  onOpen: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/g/${slug}`
      : `/g/${slug}`;

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("clipboard unavailable");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("execCommand failed");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Couldn't copy — long-press the link to copy it.");
      }
    }
  };

  return (
    <main className="min-h-dvh">
      <Toaster position="top-center" richColors />
      <section className="mx-auto max-w-xl px-6 pt-24 pb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-warm shadow-gift">
          <Check className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your gift is ready!</h1>
        <p className="mt-3 text-muted-foreground">
          Share this private link with them. Anyone with the link can tap to unwrap it once.
        </p>

        <div className="mt-8 flex items-stretch gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft">
          <div className="min-w-0 flex-1 truncate rounded-full px-4 py-2.5 text-left text-sm font-medium">
            {url}
          </div>
          <MobileButton
            type="button"
            onClick={copy}
            className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </MobileButton>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <MobileButton
            type="button"
            onClick={onOpen}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-soft transition hover:bg-secondary"
          >
            Preview the reveal
          </MobileButton>
          <MobileButton
            type="button"
            onClick={onNew}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Send another
          </MobileButton>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Heads up: this gift can only be opened once.
        </p>
      </section>
    </main>
  );
}
