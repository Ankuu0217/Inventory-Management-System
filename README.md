# Inventory Management System

A full-stack inventory tool: a REST API for products and stock levels, and a
React client that makes those levels legible at a glance. Products can be
created, edited, deleted and re-stocked; the catalogue can be searched and
filtered server-side; and a dashboard summarises stock health across it.

- **[`backend/`](backend/README.md)** — Node.js · Express · MongoDB
- **[`frontend/`](frontend/README.md)** — React · Redux Toolkit · Vite · Tailwind

## Screenshots

> Replace the placeholders below with real captures before submitting.
> Suggested shots, in this order:
>
> 1. `docs/screenshot-dashboard.png` — the dashboard at ~1440px wide
> 2. `docs/screenshot-products.png` — the products table with a filter applied
>    (so the active-filter chips are visible)
> 3. `docs/screenshot-form.png` — the Add product dialog showing the live
>    stock-status preview
> 4. `docs/screenshot-mobile.png` — the products screen at 375px, showing the
>    stacked card layout

| Dashboard | Products |
|---|---|
| _`docs/screenshot-dashboard.png`_ | _`docs/screenshot-products.png`_ |

| Product form | Mobile |
|---|---|
| _`docs/screenshot-form.png`_ | _`docs/screenshot-mobile.png`_ |

## Architecture

```
┌─────────────────────┐        HTTP/JSON         ┌──────────────────────┐
│   frontend/         │  ───────────────────►    │   backend/           │
│   React SPA         │  ◄───────────────────    │   Express REST API   │
│   RTK Query cache   │   { success, data, … }   │   Mongoose ODM       │
└─────────────────────┘                          └──────────┬───────────┘
                                                            │
                                                     ┌──────▼───────┐
                                                     │   MongoDB    │
                                                     └──────────────┘
```

The two halves are independent applications that share nothing but the REST
contract. The backend is layered (routes → validation middleware → controllers
→ Mongoose models); the frontend is feature-sliced, with container components
owning data and URL state and presentational components taking props.

**One rule shapes the whole system:** stock status (`In Stock` / `Low Stock` /
`Out of Stock`) is derived from `quantity` by the backend and is never stored
in the database and never recomputed in the client. The API is the single
source of truth for it — the UI renders whatever status the server sent.

## Tech stack, and why

### Backend

| Choice | Why |
|---|---|
| Express | Minimal, well-understood HTTP layer; the middleware chain maps cleanly onto validate → handle → centralised error handling. |
| MongoDB + Mongoose | Document shape fits a product catalogue; Mongoose adds schema validation and virtuals, which is how derived stock status stays in one place. |
| Zod | Request validation as data, so the same rules produce both the 400 response and the field-level error list the UI maps onto its form. |
| helmet · cors · rate-limit · mongo-sanitize | Baseline hardening: headers, configurable origins, abuse limits, and operator-injection stripping. |
| Jest · Supertest · mongodb-memory-server | Integration tests hit the real Express app against a real Mongo, without touching a developer's database. |
| Swagger (`/api-docs`) + Postman collection | Two ways in: browsable docs for reading, an importable collection for poking. |
| Docker Compose | One command brings up API + database with a healthcheck gate, so the reviewer never debugs a local Mongo install. |

### Frontend

| Choice | Why |
|---|---|
| React 18 + Vite | Fast dev loop; no framework-level features needed beyond routing. |
| Redux Toolkit **Query** | Server state, caching and invalidation in one place. Tag-based invalidation is why a quantity edit updates the dashboard with no manual refetch. |
| react-router | URL-backed filters, sort and pagination — a shared link reproduces exactly what the sender saw. |
| react-hook-form + Zod | One schema drives both create and edit, mirroring the backend's rules field for field. |
| Radix UI primitives (shadcn/ui pattern) | Correct focus trapping, ARIA and keyboard behaviour for dialogs, selects and popovers, themed to the tokens below rather than shipped as-is. |
| Tailwind v4 | The design tokens live in one `@theme` block; components reference them by name, so no component file contains a raw colour. |
| PropTypes + JSDoc | The frontend ships as plain JavaScript; runtime prop validation and JSDoc typedefs replace what TypeScript was doing. |
| Vitest · Testing Library · MSW | Components are tested against a mocked network, the same way they run in production. |

## Quick start

Run the backend first, then the frontend against it.

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
npm run dev              # or: docker compose up --build

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env     # point VITE_API_BASE_URL at the backend above
npm run dev
```

Then open the frontend's dev URL (Vite prints it) and the API docs at
`http://localhost:5000/api-docs`.

### Database setup

Nothing to create by hand — Mongoose creates the `products` collection and its
indexes on first write. You need a MongoDB instance reachable at
`MONGODB_URI`, and there are three easy ways to get one:

- **Docker (recommended):** `cd backend && docker compose up --build` starts
  MongoDB and the API together, with the API waiting on a Mongo healthcheck.
- **Local install:** run `mongod` and leave the default
  `mongodb://localhost:27017/inventory_management`.
- **MongoDB Atlas:** paste the connection string into `MONGODB_URI`; no code
  changes are needed.

> **macOS note:** the AirPlay Receiver often holds port 5000 (the backend's
> default). If the API fails to bind, either disable AirPlay Receiver or set a
> different `PORT` in `backend/.env` — and update `VITE_API_BASE_URL` in
> `frontend/.env` to match.

## Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Name | Description | Example |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | Port the API listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/inventory_management` |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window, in ms | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window per IP | `100` |
| `LOG_LEVEL` | winston log level | `info` |

**`frontend/.env`** (see `frontend/.env.example`)

| Name | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## Running tests

```bash
cd backend  && npm test          # Jest + Supertest against in-memory MongoDB
cd frontend && npm test          # Vitest + Testing Library + MSW
```

Both also support `npm run test:coverage`.

## API documentation

- **Swagger UI:** `http://localhost:5000/api-docs` with the backend running.
- **Postman:** import [`backend/postman/inventory-api.postman_collection.json`](backend/postman/inventory-api.postman_collection.json)
  — every endpoint, plus pre-filled failure cases so validation is visible
  immediately.
- **Endpoint reference and response shapes:** [`backend/README.md`](backend/README.md#api-reference).

## Design system

The UI follows a fixed token vocabulary — a near-white canvas held together by
1px hairline borders instead of shadows, dense monochrome type, and exactly one
saturated accent. Every token lives in
[`frontend/src/styles/globals.css`](frontend/src/styles/globals.css); component
files reference them by name and contain no raw values.

| Axis | Vocabulary |
|---|---|
| Surfaces | `canvas-white` `#ffffff` · `paper-mist` `#f5f5f5` · borders `ash` `#e5e5e5` |
| Ink | `charcoal` `#171717` body · `steel` `#525252` secondary · `fog` `#737373` muted |
| Accent | `electric-blue` `#2563eb` · `deep-sapphire` `#1e40af` for the one primary action per screen |
| Status | mint `#dcfce7`/green `#16a34a` · tangerine `#ea580c` · neutral `#f5f5f5` for out-of-stock |
| Radius | `9999px` pills · `8px` buttons · `12px` cards · `16px` feature cards · `6px` inputs — nothing else |
| Elevation | Two shadows only: a hairline lift on primary buttons, and a 4px ring on floating layers. Tables and cards stay flat. |
| Type | Inter throughout: 11–12px captions · 14px dense data · 16px body · 20–24px section titles · 30px page titles |
| Spacing | 4px base unit; 8px inline, 16px card padding, 24–32px between blocks, ~1200px max width |

There is no red in the palette, deliberately: destructive actions carry their
weight through a confirmation step rather than through colour. Status badges
always pair a dot with a text label, so colour is never the only signal.

## Repository layout

```
.
├── backend/    # Express + MongoDB REST API
├── frontend/   # React client
└── README.md   # this file
```
