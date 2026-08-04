# Phoenix Media

Full public website + admin dashboard for a cinematic production company, built per `DESIGN.md` ("Dark Obsidian Cinema").

## Setup

```
npm install
npm run dev
```

Admin dashboard: `/admin/login`
Demo credentials: `admin@phoenixmedia.com` / `phoenix2026`

## Scripts

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm test` — runs the test suite (type-check, real render tests, admin auth flow, portfolio detail rendering)

## Architecture

```
src/
├── loader/              Cinematic Phoenix loading engine (from the earlier build), gates the home page reveal
├── i18n/                EN/AR dictionaries + provider; RTL is driven by <html dir>
├── services/
│   ├── localStore.ts    Generic mock "backend" (collections/documents over localStorage)
│   ├── apiClient.ts      Auth/token/refresh + request wrapper — the seam a real backend plugs into
│   ├── types.ts          Shared domain types
│   └── endpoints/        One typed module per domain (hero, about, clients, equipment, services,
│                          portfolio, contact, social, navigation, seo, language, settings, auth)
├── hooks/
│   └── useAsync.ts       Loading/error/data pattern used by every page
├── components/
│   ├── ui/                Button, Card, Form fields, Modal, Marquee, MediaUploader, ReorderList, loading/error states
│   └── layout/             Nav, SocialIcons, LanguageSwitch, Hero-to-corner scroll progress
├── public-pages/          The public site (single-page cinematic experience + portfolio detail route)
└── admin/                 The admin dashboard (auth-guarded, sidebar layout, one page per module)
```

### Why a mock API instead of a real backend

There's no server in this environment, so `services/localStore.ts` simulates one: real async
latency, a consistent collection/document API, and localStorage persistence — so admin edits
are immediately visible on the public site in the same browser. Every `services/endpoints/*.ts`
file is written exactly as it would be against a real REST API; pointing this at a real backend
means rewriting the bodies of those functions (and `apiClient.ts`'s token/refresh logic), not
touching a single page or component.

### Data flow

No page holds hardcoded content. Every section/page calls an endpoint function through
`useAsync`, which gives consistent loading/error/data handling everywhere. Admin pages call the
same endpoint functions to mutate data, then `refetch()`.

## What's fully built

- Full public single-page site: Hero (upload/YouTube/Vimeo video, mute toggle), About (animated
  aurora/particle background, scroll-linked logo migration to the corner), Clients & Equipment
  (auto-generated alternating-direction infinite marquees), Services (reorderable cards),
  Portfolio (grid + flexible per-event page supporting hero-video, grid/masonry galleries,
  featured-people-with-sub-gallery, and text sections, plus a Behind The Scenes badge), Contact
  (form + info + map).
- Full admin dashboard: auth-guarded, one module per content type, drag-and-drop reordering
  (native HTML5 DnD, no extra dependency), drag-and-drop media "upload" (object URLs — see below),
  and a Language module that lets you override *any* translation string live.
- EN/AR with real RTL (logical CSS properties throughout — `start`/`end` not `left`/`right` —
  so layout mirrors correctly, not just text).

## Known limitations / next steps

Being upfront about where this demo simplifies things, since you said more is coming:

- **File uploads are local object URLs**, not real storage — there's no upload endpoint to point
  at. Swap `MediaUploader`'s `handleFiles` for a real upload call when a backend exists.
- **Auth is a single seeded demo credential**, not real user management.
- **"Multiple pages inside one portfolio event"** (spec scenario 6) — sections currently render
  in one continuous scroll rather than as separate tabbed/paginated views. The section model
  supports grouping into pages as a follow-up (small addition to the data shape + a tab UI).
- **Bundle size** (~1MB JS) is unoptimized — the obvious next step is route-based code-splitting
  (`React.lazy` for the entire `admin/` tree, which most visitors never load).
- No real backend, database, or file storage — by design, given the environment this was built
  in — but the API layer is shaped so adding one is a service-layer change, not an app rewrite.
