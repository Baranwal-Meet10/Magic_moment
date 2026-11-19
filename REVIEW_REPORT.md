# Comprehensive Software Engineering & Security Audit Report

**Project:** GiftLink (`tanstack_start_ts`)  
**Workspace:** `d:\project and idea\Magic_moment`  
**Review Type:** Strict, Evidence-Based Audit (Zero-Modifications Pass)  
**Date:** November 19, 2026  

---

## 1. Executive Summary

GiftLink is a web application allowing creators to compose a message, optionally attach a photo, choose an aesthetic theme, and generate an unguessable private link (`/g/:slug`) for a recipient to unwrap a 3D animated gift box once. 

### Technology Stack & Architecture
- **Framework:** TanStack Start (`@tanstack/react-start` v1.168.26) on Nitro/Vite 8, React 19, TanStack Router v1.170.16.
- **Styling & Design:** Tailwind CSS v4, OKLCH color spaces, Radix UI primitives.
- **Database & Storage:** Supabase PostgreSQL (PostgREST RPCs with `SECURITY DEFINER`), Supabase Storage (`gift-images` bucket).
- **Hosting Target:** Cloudflare Workers / Nitro SSR with client hydration.

### Quality Score: 5.8 / 10
The core cryptographic slug generation, EXIF stripping intent, and `SECURITY DEFINER` RPC abstraction demonstrate good design intentions. However, critical gaps exist: an active unpatched CVSS 9.3 XSS vulnerability in TanStack Start, a dormant but active permissive SELECT policy on the storage bucket allowing anonymous photo extraction, an N+1 duplication bug in image resolution, client memory leaks during photo processing, and a total lack of automated testing coupled with massive dependency bloat.

### Top 5 Most Serious Problems
1. **Critical Reflected XSS in TanStack Start Server Functions** (`package.json:46`): Direct dependency vulnerability (GHSA-qx66-fv34-fjm8, CVSS 9.3) allowing unauthenticated script execution.
2. **Dormant Public SELECT Policy on `gift-images` Storage Bucket** (`supabase/migration/20260820000000_enable_gift_images_read.sql:12-15`): Un-revoked storage RLS policy allows anonymous listing and downloading of uploaded photos, bypassing the single-open policy.
3. **Redundant N+1 Image Resolution Loop Duplicating Content & Server Calls** (`src/routes/g.$slug.tsx:161-182`): Calling the bulk server function `getGiftImageUrls` inside an array iteration produces $N^2$ duplicate image elements and excessive server requests.
4. **Dangerous Client-Side Fallback Leaking Photos or Failing** (`src/routes/g.$slug.tsx:184-198`): Fallback calling `getPublicUrl` and client-side `createSignedUrl` violates the architecture by exposing private files or causing broken image UI.
5. **Mobile Browser Tab Crashes from Unconstrained Canvas Dimensions** (`src/routes/create.tsx:60-63`): Allocating canvas dimensions directly to unscaled camera sensor dimensions (e.g., 48MP) triggers out-of-memory crashes on iOS WebKit and Android Chrome.

---

## 2. Test, Linter, Type-Checker & Vulnerability Results

### 2.1 Automated Test Suite
- **Command:** `npm test`
- **Result:** **FAILED** (`npm error Missing script: "test"`).
- **Findings:** Zero test files (`*.test.ts`, `*.spec.tsx`) exist in `src/`. No test runner (Vitest, Jest) is configured.

### 2.2 Type Checker (`tsc --noEmit`)
- **Command:** `npx tsc --noEmit`
- **Result:** **PASSED** (0 compilation errors).

### 2.3 Linter (`eslint .`)
- **Command:** `npx eslint .`
- **Result:** **FAILED** (3,277 problems: 3,270 errors, 7 warnings).
  - **Formatting:** 3,269 errors were `prettier/prettier` CRLF line-ending mismatches.
  - **Code Quality (`@typescript-eslint/no-explicit-any`):**
    - `src/components/toggle-group.tsx:26:19`: `Unexpected any. Specify a different type`.
  - **React Refresh Warnings (`react-refresh/only-export-components`):**
    - `src/components/badge.tsx:32:17`
    - `src/components/button.tsx:49:18`
    - `src/components/form.tsx:163:3`
    - `src/components/mobile-touch.tsx:61:17`
    - `src/components/navigation-menu.tsx:111:3`
    - `src/components/sidebar.tsx:743:3`
    - `src/components/toggle.tsx:42:18`

### 2.4 Dependency Vulnerability Audit (`npm audit`)
- **Command:** `npm audit --json`
- **Result:** **22 vulnerabilities found (7 Critical, 7 High, 8 Moderate)**.
  - **Critical (CVSS 9.3):** `@tanstack/react-start` (GHSA-qx66-fv34-fjm8) — Unauthenticated reflected XSS in TanStack Start server-function responses.
  - **High:** `vite` (GHSA-587h-7wmj-h5pm, GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw) — Arbitrary command execution and path traversal via `launch-editor` on Windows.
  - **High (CVSS 7.5):** `zod` (GHSA-mrhx-c7xc-m3w5) — Uncontrolled resource consumption / ReDoS in oversized constrained collections.

### 2.5 Secret & Credential Scanning
- **Git History & Configuration Search:**
  - `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_0IpbxfXluP9Uayt2Zbm14w_kYYEzxWF`) is present in `.env` and historical scratch scripts (`scratch-direct-storage.cjs`). This is an anonymous client key designed for public distribution.
  - No active `SUPABASE_SERVICE_ROLE_KEY` or production database passwords were leaked in git history.

---

## 3. Audited Issues by Severity

### 🔴 CRITICAL SEVERITY

#### Issue 1: Unauthenticated Reflected XSS in TanStack Start Server Functions
- **File:line:** `package.json:46`
- **Problem:** Project depends on `@tanstack/react-start: ^1.168.26`. Advisory GHSA-qx66-fv34-fjm8 affects versions `>=1.143.12 <1.168.60`.
- **Why it matters:** Server functions (such as `getGiftImageUrls` in `src/lib/gift-images.functions.ts`) process unauthenticated client requests. Crafting malicious request payloads allows arbitrary script execution within the user's browser context.
- **Fix:**
```json
// package.json:46
- "@tanstack/react-start": "^1.168.26",
+ "@tanstack/react-start": "^1.170.16",
```

#### Issue 2: Dormant Permissive Storage SELECT Policy Allowing Anonymous Bucket Harvesting
- **File:line:** `supabase/migration/20260820000000_enable_gift_images_read.sql:12-15`
- **Problem:** Migration `20260820000000` created the policy:
  ```sql
  CREATE POLICY "Anyone can read gift images" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'gift-images');
  ```
  Subsequent migrations (`20260820193000` and `20260922200000`) toggled `storage.buckets.public = false`, but **never executed `DROP POLICY`** on `storage.objects`.
- **Why it matters:** In Supabase, Row Level Security on `storage.objects` takes precedence. Any client with the anon API key can query PostgREST directly (`/storage/v1/object/list/gift-images`) to enumerate and retrieve all uploaded photos across all gifts without knowing slugs or opening gifts.
- **Fix:** Create a new migration `supabase/migration/20261120000000_revoke_storage_read_policy.sql`:
```sql
-- ============================================================================
-- Revoke insecure public read policy on gift-images storage
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can read gift images" ON storage.objects;
```

---

### 🟠 HIGH SEVERITY

#### Issue 3: N+1 Multi-Resolution Loop Generating Duplicate Images and Redundant RPCs
- **File:line:** `src/routes/g.$slug.tsx:161-182`
- **Problem:** `getGiftImageUrls({ data: { slug } })` accepts a `slug` and signs all images belonging to that gift. However, it is invoked inside an iterative `for (const path of paths)` loop:
```ts
161:  for (const path of paths) {
        ...
174:    try {
175:      const res = await getGiftImageUrls({ data: { slug } });
176:      if (res?.urls && res.urls.length > 0) {
177:        resolved.push(...res.urls);
178:        continue;
179:      }
```
- **Why it matters:** If a gift contains 3 image paths, the server function is called 3 times. On each iteration, all 3 signed URLs are appended to `resolved`, resulting in `resolved.length === 9` with 3 duplicated sets of photos.
- **Fix:** Execute `getGiftImageUrls` once for the entire slug, outside of the iteration:
```ts
// src/routes/g.$slug.tsx:155-183
async function resolveGiftImageUrls(slug: string, rawPaths: unknown): Promise<string[]> {
  const paths = parseImagePaths(rawPaths);
  if (paths.length === 0) return [];

  // Check for direct URLs first
  const directUrls = paths.filter(
    (p) => p.startsWith("data:") || p.startsWith("blob:") || p.startsWith("http://") || p.startsWith("https://")
  );
  if (directUrls.length === paths.length) {
    return directUrls;
  }

  try {
    const res = await getGiftImageUrls({ data: { slug } });
    if (res?.urls && res.urls.length > 0) {
      return res.urls;
    }
  } catch (err) {
    logDevError("resolveGiftImageUrls -> server getGiftImageUrls failed", err);
  }

  return directUrls;
}
```

#### Issue 4: Insecure Client-Side Storage Fallback Exposing Private Paths
- **File:line:** `src/routes/g.$slug.tsx:184-198`
- **Problem:** If server signing fails, client attempts:
```ts
185:  const { data, error } = await supabase.storage.from("gift-images").createSignedUrl(path, 60 * 60);
...
194:  const { data: pubData } = supabase.storage.from("gift-images").getPublicUrl(path);
```
- **Why it matters:** The anon role cannot sign URLs in private buckets (fails silently), and `getPublicUrl` exposes raw paths. If the bucket was ever toggled to public, anyone can bypass the one-time open gate.
- **Fix:** Completely remove lines 184–198 in `src/routes/g.$slug.tsx`. All signed URL generation must exclusively occur via `getGiftImageUrls` on the server using `supabaseAdmin`.

#### Issue 5: Mobile Browser Tab Crashes from Unconstrained Canvas Resizing
- **File:line:** `src/routes/create.tsx:60-63`
- **Problem:** `stripExifData` sets `canvas.width = img.naturalWidth` and `canvas.height = img.naturalHeight`.
- **Why it matters:** Modern mobile camera photos uploaded within the 5MB limit often possess 48–108 megapixels (e.g. 8000x6000). Allocating a 2D canvas of this size consumes >190MB of RAM, causing iOS WebKit and Android low-memory devices to terminate the browser tab immediately.
- **Fix:** Scale canvas down to a max bounding box (e.g. 2048px):
```ts
// src/routes/create.tsx:59-67
const MAX_DIMENSION = 2048;
let { naturalWidth: width, naturalHeight: height } = img;
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  if (width > height) {
    height = Math.round((height * MAX_DIMENSION) / width);
    width = MAX_DIMENSION;
  } else {
    width = Math.round((width * MAX_DIMENSION) / height);
    height = MAX_DIMENSION;
  }
}
canvas.width = width;
canvas.height = height;
ctx.drawImage(img, 0, 0, width, height);
```

---

### 🟡 MEDIUM SEVERITY

#### Issue 6: Malformed Sitemap Relative URLs Violating Protocol Specifications
- **File:line:** `src/routes/sitemap[.]xml.ts:4, 16`
- **Problem:** `const BASE_URL = "";` outputs `<loc>/create</loc>` and `<loc>/</loc>`.
- **Why it matters:** Search engine crawlers (Google, Bing) reject relative URL nodes according to sitemaps.org RFC specifications.
- **Fix:** Derive canonical URL from request host headers or environment variable (`process.env.APP_URL || "https://giftlink.app"`).

#### Issue 7: Cumulative Memory Leaks from Unrevoked Object URLs
- **File:line:** `src/routes/create.tsx:154, 378`
- **Problem:** `URL.createObjectURL(f)` creates a persistent heap reference. When the user removes or replaces a photo, `URL.revokeObjectURL(preview)` is never called.
- **Why it matters:** On single-page sessions where users try multiple photos, unreleased blobs remain pinned in browser memory.
- **Fix:** Track previous blob URL via a ref and call `URL.revokeObjectURL` prior to replacement or on unmount.

#### Issue 8: Concurrency Race Condition in SSR Error Capture
- **File:line:** `src/lib/error-capture.ts:4, 18-26`
- **Problem:** `lastCapturedError` is a shared global variable in module scope across concurrent SSR requests in Node/Worker runtimes.
- **Why it matters:** In concurrent traffic, Request A's error stack can be consumed by Request B's error handler.
- **Fix:** Use Node/Worker `AsyncLocalStorage` to associate captured errors with individual request contexts.

#### Issue 9: Double HTML Entity Escaping in Social OpenGraph Tags
- **File:line:** `src/routes/g.$slug.tsx:53-76`
- **Problem:** `escapeHtml` manually replaces `&` with `&amp;` and `"` with `&quot;`, after which React / TanStack Router automatically escapes attribute strings.
- **Why it matters:** Creator names like "Tom & Jerry" render as "A gift from Tom &amp;amp; Jerry" in iMessage and WhatsApp preview cards.
- **Fix:** Pass raw `creator_name` directly to TanStack Router `head` metadata without manual entity escaping.

#### Issue 10: Complete Keyboard Focus Suppression (Accessibility Failure)
- **File:line:** `src/components/mobile-touch.tsx:47, 125`
- **Problem:** CSS classes apply `outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0`.
- **Why it matters:** Violates WCAG 2.1 Success Criterion 2.4.7 (Focus Visible). Keyboard and assistive tech users receive no visual indicator when tabbing through buttons or the unwrap box.
- **Fix:** Remove `focus-visible:outline-none focus-visible:ring-0` and supply standard focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

---

### 🟢 LOW SEVERITY

#### Issue 11: Incomplete Animation State Reset on Reveal Path
- **File:line:** `src/routes/g.$slug.tsx:243, 255-257`
- **Problem:** `setUnwrapping(true)` is triggered on tap, but never reset to `false` when `opened` is set to `true`.
- **Why it matters:** The component retains `unwrapping = true` permanently. If client-side routing cache restores the view, state machine transitions become inconsistent.
- **Fix:** Call `setUnwrapping(false)` inside the timeout block that sets `opened = true`.

#### Issue 12: Orphan Debug/Scratch Script in Production Codebase
- **File:line:** `src/test-storage.ts:1-17`
- **Problem:** A standalone test script exists in `src/` attempting to list and create public buckets via the client SDK.
- **Why it matters:** Unnecessary code shipping in workspace, encouraging insecure patterns (`public: true`).
- **Fix:** Remove `src/test-storage.ts`.

#### Issue 13: 37 Dead / Unused Component Files and 32 Unused NPM Packages
- **File:line:** `src/components/*` & `package.json:16-41, 51-54, 57, 60-61, 66`
- **Problem:** 37 scaffolded UI components (`accordion.tsx`, `chart.tsx`, `carousel.tsx`, `calendar.tsx`, `drawer.tsx`, etc.) are never imported anywhere in the application.
- **Why it matters:** Bloats dependency tree, increases attack surface, and accounts for over 3,000 linter errors.
- **Fix:** Delete unreferenced component files and uninstall unused dependencies (`cmdk`, `recharts`, `embla-carousel-react`, etc.).

#### Issue 14: Total Absence of Automated Testing
- **File:line:** `package.json:6-13`
- **Problem:** No test script or testing framework is configured.
- **Why it matters:** High-risk refactorings (such as theme expansion or rate limiting changes) lack automated safety nets.
- **Fix:** Install Vitest and create baseline unit tests for `theme.ts`, `dev-logger.ts`, and RPC client callers.

---

## 4. Prioritized Action Plan

1. **Phase 1: Immediate Security Remediation (Day 1)**
   - Update `package.json` to upgrade `@tanstack/react-start` to `>=1.168.60` to patch GHSA-qx66-fv34-fjm8.
   - Deploy SQL migration dropping `Anyone can read gift images` RLS policy on `storage.objects`.
   - Remove client-side public URL fallback in `src/routes/g.$slug.tsx`.
2. **Phase 2: Core Stability & Mobile Fixes (Day 2)**
   - Fix `resolveGiftImageUrls` N+1 loop in `src/routes/g.$slug.tsx`.
   - Add max dimension bounding box downscale to canvas in `src/routes/create.tsx` to stop mobile tab crashes.
   - Fix `BASE_URL` in `src/routes/sitemap[.]xml.ts`.
3. **Phase 3: Codebase Cleanliness & Maintainability (Week 1)**
   - Delete `src/test-storage.ts` and prune 37 unused UI components.
   - Run `npm run format` to fix 3,269 CRLF Prettier errors.
   - Set up Vitest and write core regression tests for gift unwrap and photo signing.

---

## 5. Quick Wins (< 10 Minutes Each)

1. **Delete `src/test-storage.ts`**: Removes dead code attempting insecure bucket creations.
2. **Fix `src/routes/sitemap[.]xml.ts` line 4**: Replace `const BASE_URL = "";` with `const BASE_URL = process.env.APP_URL || "https://giftlink.app";`.
3. **Fix Double HTML Escaping in `src/routes/g.$slug.tsx` line 56**: Remove manual `escapeHtml` wrapper so names display properly in social previews.
4. **Fix Focus Rings in `src/components/mobile-touch.tsx` lines 47 & 125**: Remove `focus-visible:outline-none focus-visible:ring-0` to restore accessibility.
5. **Fix State Reset in `src/routes/g.$slug.tsx` line 256**: Add `setUnwrapping(false)` when `opened` is set to `true`.

---

## 6. What Could Not Be Reviewed & Why

- **Live Production Database Contents:** Direct live Supabase PostgreSQL production table contents and active live RLS runtime states could not be dynamically queried due to read-only workspace review constraints and absence of live production credentials.
- **Cloudflare Worker Runtime Logs:** Production CDN / edge headers (`cf-connecting-ip`) were evaluated via codebase logic and migrations; live traffic inspection was not accessible.
- **Binary Video Assets (`src/assets/loading.mp4`):** Binary integrity and frame optimization was not decompiled or analyzed.

---

## 7. Second Pass Findings (Self-Check Pass)

During the secondary audit verification pass:
- **`process.env` in Browser Client Bundle (`src/integrations/supabase/client.ts:33-34`)**: Evaluating `process.env.SUPABASE_URL` without `typeof process !== "undefined"` fallback will throw a `ReferenceError` in strict modern browser ESM environments if Vite does not define `process` globally.
- **Unchecked Function Return Type (`src/routes/create.tsx:264`)**: `if (!data || typeof data !== "string")` throws a generic error rather than logging dev details, making server-side RPC signature mismatches difficult to debug in staging environments.
- **Dead Code Function (`src/routes/create.tsx:101-112`)**: `generateSlug()` is declared locally in `create.tsx` but never invoked because slugs are generated server-side by `public.generate_gift_slug()`. It can be safely removed.
