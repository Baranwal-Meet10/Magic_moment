<div align="center">

# 🎁 GiftLink (Magic Moment)

  <p align="center">
    <b>A privacy-focused, interactive digital gift-unwrapping web application.</b>
    <br />
    Create custom gift messages with curated visual themes and photos, shared via unguessable secret links, unwrappable exactly once.
  </p>

  <p align="center">
    <a href="#features">Key Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#security--architecture">Security & Architecture</a> •
    <a href="#license">License</a>
  </p>

  ---
</div>

## ✨ Features

- **🎁 One-Time Unwrap Choreography**: Interactive 3D/touch-optimized gift box. Tapping pops the lid, flies the ribbon, radiates a sparkle burst, falls confetti, and reveals the message with a staggered blur-in effect.
- **🔒 Single-Open Guarantee**: Gifts flip state atomically in Postgres upon unwrapping. Subsequent visits show a lock screen confirming when it was unwrapped.
- **🎨 Dynamic Theme Engine**: 5 built-in OKLCH themes (**Birthday**, **Love**, **Thanks**, **Holiday**, **Welcome**) with dynamic page background gradients, box color palettes, and theme-matching confetti.
- **📸 Private Media Uploads**: Optional photo attachments stored in private Supabase storage. Images are rendered using short-lived signed URLs generated only after successful unwrapping.
- **🛡️ Production Security Hardening**:
  - **Server-Side Cryptographic Slugs**: 16-character base64url slugs generated in PL/pgSQL using `gen_random_bytes(12)` entropy.
  - **Database-Level Rate Limiting**: IP-based rate limiting table and functions enforcing request limits on creation (5/10m), slug lookups (30/m), and unwrapping (10/m).
  - **Zero Direct Table Access**: RLS enabled with direct table access revoked for anonymous/authenticated roles; all interactions routed through pinned `SECURITY DEFINER` RPCs.
- **📱 Touch & Motion Accessibility**: Mobile-first design with touch-action optimizations and strict `prefers-reduced-motion` CSS support.

---

## 🧪 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/router) / [TanStack Router](https://tanstack.com/router)
- **Build Tool & Server Engine**: [Vite](https://vitejs.dev/) + [Nitro Engine](https://nitro.unjs.io/) (Target: Cloudflare Workers)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons + Sonner Toasts
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL PL/pgSQL, Row Level Security, Storage Buckets)
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project

### Environment Setup

Create a `.env` file in the root directory (do not commit this file to source control):

```env
# Client-side (Vite)
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"

# Server-side (Nitro SSR / Admin functions)
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Baranwal-Meet10/Magic_moment.git
   cd Magic_moment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🏛️ Security & Architecture

GiftLink enforces strict separation of privilege between client-side code and backend database storage:

```
[ Visitor / Recipient ]
       │
       ▼ (Calls SECURITY DEFINER RPCs)
┌─────────────────────────────────────────────────────────────┐
│                      Supabase PostgREST                     │
├───────────────────────────┬─────────────────────────────────┤
│ RPC: create_gift()        │ Generates 16-char crypto slug   │
│ RPC: get_gift_by_slug()   │ Metadata only (no message)      │
│ RPC: open_gift()          │ One-time message & photo reveal │
│ Table: rate_limits        │ IP-based request throttling     │
└───────────────────────────┴─────────────────────────────────┘
       │
       ▼ (Direct table access DENIED to anon/authenticated)
┌─────────────────────────────────────────────────────────────┐
│                    Postgres `public.gifts`                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Security Policies

1. **Direct Data API Access Revoked**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions on `public.gifts` are revoked from `anon` and `authenticated`.
2. **Metadata vs. Message Isolation**: `get_gift_by_slug` returns only visual metadata (`theme`, `creator_name`, `is_opened`). The actual gift message and image paths are stored securely and exposed strictly through `open_gift` upon first unwrap.
3. **Private Image Bucket**: `gift-images` bucket operates with `public = false`. Images are signed server-side only when `is_opened = true`.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.