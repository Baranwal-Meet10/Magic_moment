// ---------------------------------------------------------------------------
// Signed URL issuance for gift photos.
// ---------------------------------------------------------------------------
// The `gift-images` bucket is private and has NO public SELECT policy, so the
// browser (anon key) cannot list, read, or sign anything in it. The only way
// to view a photo is through this server function, which:
//   1. looks the gift up by slug with the service-role client,
//   2. refuses unless the gift has already been unwrapped (is_opened = true),
//   3. signs ONLY the paths that belong to that specific gift.
// This makes bucket-wide reads impossible: knowing another gift's file path is
// useless, because paths are never accepted from the client.
//
// SECURITY NOTES:
// - Slug format is validated (base64url only) to reject injection attempts.
// - Constant-time response pattern prevents timing side-channels.
// - Signed URLs expire in 15 minutes (was 60 min).
// ---------------------------------------------------------------------------
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Base64url slug format: only [A-Za-z0-9_-], 8-32 chars
const SLUG_PATTERN = /^[A-Za-z0-9_-]{8,32}$/;

const inputSchema = z.object({
  slug: z.string().trim().min(8).max(32).regex(SLUG_PATTERN, "Invalid slug format"),
});

/** Async delay for constant-time responses */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getGiftImageUrls = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ urls: string[] }> => {
    const startTime = Date.now();
    // Minimum response time to prevent timing side-channels (150ms floor)
    const MIN_RESPONSE_MS = 150;

    try {
      if (typeof process !== "undefined" && !process.env?.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("[server] getGiftImageUrls: SUPABASE_SERVICE_ROLE_KEY not configured");
        await delay(Math.max(0, MIN_RESPONSE_MS - (Date.now() - startTime)));
        return { urls: [] };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: gift, error } = await supabaseAdmin
        .from("gifts")
        .select("image_urls, is_opened")
        .eq("slug", data.slug)
        .maybeSingle();

      // Never leak why: unknown slug, closed gift and no photos all look alike.
      if (error || !gift || !gift.is_opened) {
        await delay(Math.max(0, MIN_RESPONSE_MS - (Date.now() - startTime)));
        return { urls: [] };
      }

      const paths = (gift.image_urls ?? []).slice(0, 3);
      if (paths.length === 0) {
        await delay(Math.max(0, MIN_RESPONSE_MS - (Date.now() - startTime)));
        return { urls: [] };
      }

      // Sign URLs with 15-minute expiry (reduced from 60 min for tighter security)
      const { data: signed, error: signError } = await supabaseAdmin.storage
        .from("gift-images")
        .createSignedUrls(paths, 15 * 60);

      if (signError || !signed) {
        await delay(Math.max(0, MIN_RESPONSE_MS - (Date.now() - startTime)));
        return { urls: [] };
      }

      return { urls: signed.map((s) => s.signedUrl).filter((u): u is string => !!u) };
    } catch (err) {
      console.warn("[server] getGiftImageUrls failed:", err);
      await delay(Math.max(0, MIN_RESPONSE_MS - (Date.now() - startTime)));
      return { urls: [] };
    }
  });
