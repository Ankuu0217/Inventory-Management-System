# Inventory Management System — Frontend

A React + TypeScript frontend for the Inventory Management System, wired to the
existing Express/MongoDB backend (see [`../backend`](../backend)). Dashboard,
product CRUD, search/filter/pagination, and quantity adjustments — all backed
by real API calls with real loading/empty/error states.

## Overview

- **Dashboard** — core stats (total products, total quantity, low/out-of-stock
  counts) plus two bonus metrics (total inventory value, category breakdown),
  all pulled live from `GET /api/dashboard`.
- **Products** — a searchable, filterable, paginated table (stacked cards on
  mobile) with create/edit/delete and a dedicated quantity-adjust control.
  Filters and pagination live in the URL query string, so a refresh or a
  shared link preserves state.
- **Stock status is never recomputed client-side** — the badge always renders
  whatever `stockStatus` the API returned, so there is exactly one source of
  truth for that business rule.

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite + TypeScript (strict) | Typed API responses and form state catch real bugs at compile time. |
| Server state | Redux Toolkit + RTK Query | Idiomatic, interview-recognizable CRUD + caching with Redux — no hand-rolled `useEffect`/`fetch`. Tag-based invalidation (`Product`, `Dashboard`) means a quantity edit anywhere automatically refreshes the dashboard, with no manual refetch wiring. |
| Routing | react-router-dom (see note below) | Client-side routes for `/dashboard`, `/products`, `/products/:id` (deep-linkable detail view). |
| Forms | react-hook-form + zod (`@hookform/resolvers`) | One schema (`productSchema.ts`), reused for both create and edit, mirroring the backend's validation rules exactly. |
| UI primitives | shadcn/ui pattern (Radix UI + cva), hand-built to match the design tokens below | Radix gives correct keyboard/focus/ARIA behavior for dialogs, selects, and popovers for free — exactly what the accessibility bar requires. Rather than run the interactive `shadcn` CLI (which prompts and can't be steered non-interactively), the primitives were authored directly from the same well-known shadcn source patterns, themed to this project's tokens from the start. |
| Styling | Tailwind CSS v4, `@theme` tokens in `src/styles/globals.css` | See "Design tokens" below. |
| Toasts | sonner, restyled via `classNames` | Every mutation (create/update/delete/quantity) ends in a toast — success or a real error message, never a silent failure. |
| Testing | Vitest + React Testing Library + MSW | MSW mocks the API at the network layer, so components are tested exactly as they run against the real backend. |

### A note on `react-router-dom`'s version

The brief asked for v6. `npm audit` flagged two moderate CVEs (an open-redirect
in `<Link>`/`useNavigate`, and an SSR-hydration issue) affecting every 6.x and
early-7.x release, fixed only starting at 7.18.0 — there is no patched 6.x.
This app uses `react-router-dom@7.18.3` in plain "library mode"
(`<BrowserRouter>`/`<Routes>`/`<Route>`, no framework/SSR features), which is
API-identical to v6 for everything used here. Shipping a version with a known,
patched-elsewhere vulnerability over one two minor versions newer with an
unchanged API was the more defensible call — mirrors the same reasoning
documented in the backend's README for its Express version.

## Design tokens

The `@theme` block in `src/styles/globals.css` is applied verbatim from the
design brief: canvas/paper/ash/charcoal neutrals, one committed accent
(`deep-sapphire`) for primary actions, `radius-inputs/buttons/cards/largecards`
for the shape vocabulary, and `shadow-subtle`/`shadow-ring` as the only two
shadows in the system (everything else is a 1px `ash` border). Every
component reads these tokens by class name (`bg-canvas-white`, `border-ash`,
`rounded-buttons`, ...) — no inline hex colors or one-off pixel values in
component files.

Two additions beyond the brief's literal token list, both minimal and in the
same spirit:

- **`--text-heading-sm` / `--text-heading`** (24px / 30px) — the brief named
  these as the page-title scale but the provided `@theme` block didn't define
  them, so they were added as a small, focused extension.
- **Icon sizing** — the custom spacing scale redefines `4`, `8`, `12`, `16`,
  `20`, `24`, `32`, `48`, `64` so the utility *number* equals its *pixel*
  value (`px-16` = 16px), rather than Tailwind's default rem-based scale. That
  means the old shadcn convention of `size-4`/`h-4 w-4` for a 16px icon now
  renders at **4px** under this token system — so icons throughout this app
  use `h-16 w-16` (or `size-16`) instead, which is the number that actually
  means 16px here. Worth flagging since it's an easy trap when reusing shadcn
  boilerplate against a redefined spacing scale.

Satoshi (the display face for the one-time "empty state" display moment) is
intentionally not loaded from Fontshare, per the brief's own documented
fallback: `font-satoshi` resolves to Inter in the stack, paired with
`tracking-[-0.02em]` where used, avoiding an extra external font dependency.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your running backend
```

Make sure the backend is running first (see [`../backend/README.md`](../backend/README.md)
— `npm run dev` or `docker compose up` from `backend/`).

### Run in dev

```bash
npm run dev
```

### Build for production

```bash
npm run build   # tsc -b && vite build, output in dist/
npm run preview # serve the production build locally
```

### Run tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with a coverage report
```

### Lint / format

```bash
npm run lint
npm run lint:fix
npm run format
```

## Environment Variables

| Name | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api` |

> **macOS note:** if the backend's default port 5000 is taken by the AirPlay
> Receiver, point this at whatever port the backend actually started on
> (see the backend README).

## Project Structure

```
src/
├── app/          # Redux store, RTK Query middleware, route tree
├── api/          # RTK Query endpoint definitions (products, dashboard)
├── features/     # Screen-level containers + the components they own
│   ├── dashboard/
│   └── products/
├── components/
│   ├── layout/   # AppShell (sidebar + responsive drawer)
│   └── ui/       # shadcn-style primitives, themed to this project's tokens
├── hooks/        # useDebouncedValue
├── lib/          # cn(), formatters, error-message extraction, constants
├── types/        # Product, ApiEnvelope<T>, PaginatedResponse<T>, ...
└── styles/       # globals.css — the @theme block lives here
```

Containers (`ProductsPage`, `DashboardPage`) own data-fetching and URL state;
everything else (`ProductTable`, `ProductToolbar`, `StockStatusBadge`, ...) is
presentational, taking data and callbacks as props.
