# Phase 2: Database Schema & RPC Hardening

## Status: ✅ Done (Commit `97af80e`)

## Goal
Ensure Supabase stored procedures and API endpoints permit all 12 themes without throwing `invalid theme` SQL exceptions, and implement client-side defensive fallbacks.

## Requirements & Implementation
1. **Migration SQL**:
   - Location: `supabase/migration/20261119190000_expand_theme_whitelist.sql`
   - Content: Updates `create_gift` function to allow all 12 themes:
     ```sql
     IF _theme NOT IN (
       'birthday', 'love', 'thanks', 'holiday', 'welcome',
       'congrats', 'celestial', 'ocean', 'party', 'romance',
       'botanical', 'sunset'
     ) THEN
       RAISE EXCEPTION 'invalid theme';
     END IF;
     ```

2. **Defensive Client Fallback in `create.tsx`**:
   - Located at `src/routes/create.tsx:240-248`.
   - If calling `create_gift` fails with an `invalid theme` error (e.g. against an unmigrated remote Supabase instance), it automatically logs a dev warning and retries with `birthday` so the user is never blocked from creating their gift:
     ```tsx
     if (rpcResult.error && rpcResult.error.message?.includes("invalid theme") && theme !== "birthday") {
       logDevError("create.tsx -> rpc.create_gift fallback to birthday", rpcResult.error);
       rpcResult = await supabase.rpc("create_gift", {
         _message: message.trim(),
         _creator_name: creatorName.trim() || "",
         _theme: "birthday",
         _image_urls: imageUrls,
       });
     }
     ```
