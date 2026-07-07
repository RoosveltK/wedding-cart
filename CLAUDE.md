# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-tenant wedding invitation site for **Diane & Martial** (Next.js 16, App Router, React 19, Tailwind 4). There is exactly one `event` row in the database — this is not a multi-tenant SaaS. Two areas:

- **Guest-facing**: `/billet/[token]` — a one-page animated invitation ("collage vintage" aesthetic: torn paper, dried flowers, washi tape, wax seal) that a guest reaches via a personal link, ending in a downloadable PDF ticket with a QR code.
- **Admin back-office**: `/admin` — manage the event details and the guest list (add/import/export/WhatsApp share), protected by Supabase Auth.

## Commands

```bash
pnpm dev       # start dev server (Turbopack)
pnpm build     # production build — run this to typecheck + catch build errors
pnpm start     # run the production build
pnpm lint      # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite. Use `pnpm build` as the correctness gate (it runs the TypeScript compiler).

## Architecture

### Auth gating

`proxy.ts` (Next.js middleware) is the only auth boundary: it redirects `/admin/*` to `/login` when there's no Supabase session, and `/login` to `/admin` when there is one. There's a single admin user (Supabase Auth), no roles/permissions system.

### Data access pattern

- `lib/supabase/client.ts` — browser client (`"use client"` components).
- `lib/supabase/server.ts` — server client for Server Components (reads cookies via `next/headers`).
- The guest-facing page **never queries the `guests` table directly**. It calls the `get_billet(p_token)` Postgres RPC function, which is the only way to resolve a token to a guest's invitation data. This keeps the full guest list from being exposed to an unauthenticated client. Admin pages, by contrast, query `event`/`guests` tables directly since they're behind auth.
- `lib/supabase/database.types.ts` is hand-maintained (not auto-generated in this repo) — when the Supabase schema changes (columns, the `get_billet` RPC signature, etc.), update this file manually to keep types in sync.

### Guest invitation flow

`app/billet/[token]/page.tsx` is a small state machine: `loading → not-found | envelope → ticket`. The envelope (`components/ticket/Envelope.tsx`) is a click-to-open gate; opening it swaps in `components/site/WeddingSite.tsx`, the actual one-page site (hero → mariés → video message → programme → lieu → billet/QR/PDF download).

### Decorative design system

`components/site/decor.tsx` centralizes the visual language shared across the whole guest experience: the `PALETTE` object (paper tones + the wedding's actual colors — royal blue `royal`/`royalDeep` and gold `or`), plus reusable SVG decor pieces (`TornEdge`, `DriedFlowers`, `WashiTape`, `BrushStroke`, `SprigDivider`, `PaperGrain`). When changing the theme's colors or motifs, change them here rather than hardcoding hex values in individual components — `Envelope.tsx` and `WaxSeal.tsx` also pull from this palette to stay visually consistent with the rest of the site.

Fonts: Great Vibes (`font-script`) for names/headings, Cormorant Garamond (`font-serif`) for body text — both loaded via `next/font/google` in `app/billet/[token]/layout.tsx` and exposed as CSS variables (`--font-script`, `--font-serif`) consumed through Tailwind's `@theme inline` in `app/globals.css`.

### PDF ticket generation

`components/ticket/InvitationPdf.tsx` (rendered via `@react-pdf/renderer`, triggered from `DownloadPdfButton.tsx`) recreates the poster look as a downloadable A5 PDF, including the guest's name (each ticket is unique) and a QR code encoding the guest's billet URL.

**Important gotcha**: `@react-pdf/renderer`'s font engine (fontkit) only reads TTF, not WOFF2 — using the site's WOFF2 fonts here makes text silently disappear from the PDF. That's why `public/fonts/` has separate `.ttf` copies (`GreatVibes-Regular.ttf`, `CormorantGaramond-Medium.ttf`, `CormorantGaramond-SemiBold.ttf`) registered specifically for `InvitationPdf.tsx`, distinct from the `.woff2` files used by `next/font` on the web page.

Also: absolutely-positioned `<Svg>` elements in a react-pdf `<Page>` must be wrapped in an absolutely-positioned `<View>` — otherwise react-pdf can push trailing content onto a spurious second page.

### Other notable helpers

- `lib/token.ts` — generates guest tokens via `nanoid` with an unambiguous-character alphabet (no `0/O/1/l` confusion), 24 chars, used as the unguessable `/billet/[token]` slug.
- `lib/guestExcel.ts` — Excel (`xlsx`) template download, import (tolerant header aliasing for French column names like "Nom"/"Invité"/"Téléphone"), and export of the guest list with generated billet links.
- `lib/calendar.ts` — builds "Add to Google Calendar" links from event fields.
- `lib/format.ts` — date/time formatting for the poster-style date display (`formatPosterDate` splits an ISO date into weekday/day/month/year/time parts matching the affiche layout).
