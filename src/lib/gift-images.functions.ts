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
// ---------------------------------------------------------------------------
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  slug: z.string().trim().min(8).max(32),
});

export const getGiftImageUrls = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ urls: string[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    console.time('[server] getGiftImageUrls-db');
    const { data: gift, error } = await supabaseAdmin
      .from("gifts")
      .select("image_urls, is_opened")
      .eq("slug", data.slug)
      .maybeSingle();
    console.timeEnd('[server] getGiftImageUrls-db');

    // Never leak why: unknown slug, closed gift and no photos all look alike.
    if (error || !gift || !gift.is_opened) return { urls: [] };

    const paths = (gift.image_urls ?? []).slice(0, 3);
    if (paths.length === 0) return { urls: [] };

    console.time('[server] getGiftImageUrls-sign');
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("gift-images")
      .createSignedUrls(paths, 60 * 60);
    console.timeEnd('[server] getGiftImageUrls-sign');

    if (signError || !signed) return { urls: [] };

    return { urls: signed.map((s) => s.signedUrl).filter((u): u is string => !!u) };
  });
