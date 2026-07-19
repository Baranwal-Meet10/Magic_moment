// ---------------------------------------------------------------------------
// /create — Gift authoring flow
// ---------------------------------------------------------------------------
// Two screens rendered from this route:
//   1. CreatePage    — form: message, optional name, theme, optional photo.
//   2. CreatedScreen — success view with the shareable /g/:slug URL.
//
// Data path:
//   photo (optional) → storage bucket `gift-images` at `<slug>/<uuid>.<ext>`
//   row              → `gifts` table. image_urls stores the storage PATH,
//                      not a public URL — reveal page signs it on demand.
// ---------------------------------------------------------------------------
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, ArrowLeft, Image as ImageIcon, Loader2, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/lib/slug";
import { toast } from "sonner";
import { Toaster } from "sonner";

export const Route = createFileRoute("/create")({
  component: CreatePage,
  head: () => ({
    meta: [
      { title: "Create a gift · GiftLink" },
      {
        name: "description",
        content: "Write a message, add a photo, and get a private link to share.",
      },
    ],
  }),
});

// Upload constraints — mirrored in the storage bucket policy.
const MAX_MB = 5;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

function CreatePage() {
  const navigate = useNavigate();
  // --- Form state ---------------------------------------------------------
  const [message, setMessage] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [theme, setTheme] = useState<"birthday" | "love" | "thanks" | "holiday">("birthday");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // --- Submit state -------------------------------------------------------
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

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

  // Map a raw RPC/upload error to a user-friendly, non-leaking message.
  // We only surface known server-side validation messages; anything else
  // collapses to a generic string so DB internals never reach the UI.
  const friendlyError = (err: unknown): string => {
    const raw =
      (err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message ?? "")
        : ""
      ).toLowerCase();
    if (raw.includes("message too long")) return "Your message is too long. Please shorten it.";
    if (raw.includes("message required")) return "Please add a message before sending.";
    if (raw.includes("name too long")) return "That name is a bit too long — try a shorter one.";
    if (raw.includes("invalid theme")) return "Please pick a theme.";
    if (raw.includes("too many images")) return "You can only add one photo.";
    if (raw.includes("invalid slug")) return "Something went wrong. Please try again.";
    if (raw.includes("payload too large") || raw.includes("exceeded the maximum"))
      return `That photo is too large. Max ${MAX_MB}MB.`;
    if (raw.includes("network") || raw.includes("failed to fetch"))
      return "Network issue. Check your connection and try again.";
    return "Couldn't create the gift. Please try again.";
  };

  // Create the gift: upload photo (if any), then insert the row via RPC.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Add a message first.");
      return;
    }
    setSubmitting(true);
    try {
      const slug = generateSlug();
      let imageUrls: string[] = [];

      // 1. Upload image to private bucket, keyed by slug.
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${slug}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gift-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (upErr) throw upErr;
        imageUrls = [path];
      }

      // 2. Insert the gift row via SECURITY DEFINER RPC.
      //    Direct table INSERT is blocked by RLS; the RPC validates inputs
      //    server-side and is the only public write path.
      const { error } = await supabase.rpc("create_gift", {
        _slug: slug,
        _message: message.trim(),
        _creator_name: creatorName.trim() || "",
        _theme: theme,
        _image_urls: imageUrls,
      });
      if (error) throw error;

      setCreatedSlug(slug);
    } catch (err) {
      // Log full detail for developers; show user only a safe, mapped message.
      console.error("[create] gift creation failed", err);
      toast.error(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (createdSlug) {
    return <CreatedScreen slug={createdSlug} onNew={() => {
      setCreatedSlug(null);
      setMessage("");
      setCreatorName("");
      setImageFile(null);
      setPreview(null);
    }} onOpen={() => navigate({ to: "/g/$slug", params: { slug: createdSlug } })} />;
  }

  const themes: { id: typeof theme; label: string; swatch: string }[] = [
    { id: "birthday", label: "Birthday", swatch: "bg-gradient-warm" },
    { id: "love", label: "Love", swatch: "bg-[oklch(0.66_0.22_15)]" },
    { id: "thanks", label: "Thanks", swatch: "bg-[oklch(0.75_0.14_85)]" },
    { id: "holiday", label: "Holiday", swatch: "bg-[oklch(0.55_0.15_150)]" },
  ];

  return (
    <main className="min-h-screen">
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
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Wrap your gift</h1>
        <p className="mt-3 text-muted-foreground">
          Write something they'll want to keep. Add one photo if you like.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
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
              placeholder="Happy birthday! Here's to another year of…"
              rows={5}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {message.length}/1000
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Theme</label>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
                    theme === t.id
                      ? "border-primary bg-secondary"
                      : "border-border bg-background hover:border-input"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full ${t.swatch}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
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
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-10 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
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

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-warm py-4 text-base font-medium text-primary-foreground shadow-gift transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Wrapping…
              </>
            ) : (
              <>
                <Gift className="h-5 w-5" /> Create gift link
              </>
            )}
          </button>
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
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen">
      <Toaster position="top-center" richColors />
      <section className="mx-auto max-w-xl px-6 pt-24 pb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-warm shadow-gift">
          <Check className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your gift is ready.</h1>
        <p className="mt-3 text-muted-foreground">
          Share this link with them. It's private — only people you send it to can open it.
        </p>

        <div className="mt-8 flex items-stretch gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft">
          <div className="flex-1 truncate rounded-full px-4 py-2.5 text-left text-sm font-medium">
            {url}
          </div>
          <button
            onClick={copy}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={onOpen}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-soft transition hover:bg-secondary"
          >
            Preview the reveal
          </button>
          <button
            onClick={onNew}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Send another
          </button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Heads up: this gift can only be opened once.
        </p>
      </section>
    </main>
  );
}
