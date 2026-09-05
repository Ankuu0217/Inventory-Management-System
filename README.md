# Inventory Management System

A full MERN-stack take-home submission: a REST API backend and a React
frontend, built as two separate, focused passes.

- **[`backend/`](backend/README.md)** — Node.js/Express/MongoDB REST API.
  Product CRUD, a dedicated quantity-update endpoint, server-side
  search/filter/pagination, and a `$facet`-aggregation dashboard. Derived
  (never persisted) stock status. Zod validation, centralized error handling,
  Swagger docs + a Postman collection, Jest/Supertest tests against
  `mongodb-memory-server`, Docker Compose for local development.
- **[`frontend/`](frontend/README.md)** — React 18 + TypeScript (strict),
  Redux Toolkit + RTK Query, react-hook-form + zod, and a hand-themed
  shadcn/ui-style component set built on Radix primitives. Dashboard,
  searchable/filterable/paginated products table (with a mobile card
  layout), create/edit/delete, and a dedicated quantity-adjust control —
  all wired to the real backend with real loading/empty/error states.

## Quick start

Run the backend first, then the frontend against it.

```bash
# Terminal 1 -- backend
cd backend
npm install
cp .env.example .env
npm run dev              # or: docker compose up --build

# Terminal 2 -- frontend
cd frontend
npm install
cp .env.example .env     # point VITE_API_BASE_URL at the backend above
npm run dev
```

Full setup, environment variables, Docker instructions, API reference, and
test instructions for each half live in their own READMEs linked above.

> **macOS note:** the AirPlay Receiver often holds port 5000 (the backend's
> default). If `npm run dev` or `docker compose up` fails to bind it, either
> disable AirPlay Receiver or set a different `PORT` in `backend/.env` — and
> update `frontend/.env`'s `VITE_API_BASE_URL` to match.

## Repository layout

```
.
├── backend/    # Express + MongoDB REST API
├── frontend/   # React + TypeScript client
└── README.md   # this file
```

Each half has its own `package.json`, dependencies, and test suite — they are
built and run independently, connected only by the REST API contract
documented in `backend/README.md`.
