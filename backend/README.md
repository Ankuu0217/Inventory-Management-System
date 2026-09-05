# Inventory Management System — Backend

A REST API for managing product inventory: CRUD, server-side search/filter/pagination,
and aggregate dashboard statistics. Built as a backend-only take-home assignment —
no frontend, no authentication (not required by the spec).

## Overview

- Products have `name`, `category`, `price`, `quantity`, `createdAt`, `updatedAt`.
- Stock status (`In Stock` / `Low Stock` / `Out of Stock`) is **derived** from `quantity`
  at read time via a Mongoose virtual — it is never persisted, so it can never drift
  out of sync with the actual quantity.
- Search, category filtering, and stock-status filtering are all done server-side in
  the database query (via Mongo query operators), not in application code after
  fetching everything.
- Dashboard statistics are computed with a single MongoDB aggregation pipeline
  (`$facet`), not multiple round-trips or in-memory reduction.

## Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 20.x |
| Framework | Express 4.x |
| Database | MongoDB + Mongoose |
| Validation | Zod (schema-based middleware) |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Logging | winston (app errors) + morgan (HTTP access log, dev only) |
| Testing | Jest + Supertest + mongodb-memory-server |
| API docs | swagger-jsdoc + swagger-ui-express, plus a Postman collection |
| Dev tooling | nodemon, ESLint (airbnb-base), Prettier |
| Containerization | Docker + docker-compose |

### Why Express 4, not Express 5?

Express 5 was evaluated first. It was dropped for one concrete, reproducible reason:
Express 5 makes `req.query` a read-only getter that is recomputed from the raw URL on
every access, and `express-mongo-sanitize@2.x` (the sanitizer this spec calls for)
unconditionally does `req.query = sanitized` on every request — which throws under
Express 5 and 500s on literally every request that reaches it. Express 4.22.x has no
such incompatibility, is still a fully current, actively maintained release, and is
what the wider security-middleware ecosystem (including the exact packages this spec
requires) is built and tested against. Using well-understood, standard packages as
specified, over hand-rolling a sanitizer to chase a newer major version, was judged
the more defensible engineering call.

## Architecture

```
src/
├── config/       # env validation (fail-fast) + Mongoose connection (retry-on-failure)
├── models/       # Product schema + stockStatus virtual + thresholds (single source of truth)
├── controllers/  # thin: parse request → call model/query → shape response
├── routes/       # Express routers + @openapi JSDoc annotations
├── middlewares/  # asyncHandler, Zod validate(), centralized errorHandler, notFound
├── validators/   # Zod schemas — the source of truth for request-time validation
├── utils/        # ApiError, ApiResponse envelope, winston logger, regex escaping
├── docs/         # swagger-jsdoc config
├── app.js        # Express app: middleware chain, routes, error handlers (no listen())
└── server.js     # connects DB, starts the HTTP server, graceful shutdown
```

Controllers stay thin — all stock-status logic (thresholds, derivation, and the
reverse mapping from a status filter back to a quantity range) lives once in
`src/models/product.model.js` and is imported everywhere it's needed (API responses,
list filtering, dashboard aggregation, tests), so it can't drift.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # edit values as needed
```

### Run in dev (requires a local MongoDB, or point MONGODB_URI at Atlas)

```bash
npm run dev
```

### Run with Docker

```bash
docker compose up --build
```

This starts `mongo` (with a healthcheck) and `backend` (which waits for Mongo to be
healthy before starting — no fixed sleep). The API is then available at
`http://localhost:5000` (or whatever `PORT` is set to in `.env`).

> **macOS note:** macOS's AirPlay Receiver often binds port `5000` by default. If
> `docker compose up` fails with "address already in use", either disable AirPlay
> Receiver (System Settings → General → AirDrop & Handoff) or set a different `PORT`
> in `.env` before starting.

### Run tests

```bash
npm test              # runs the full suite once (in-memory MongoDB, no real DB needed)
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

All variables are validated at startup (`src/config/env.js`) — the app fails fast
with a clear message if a required one is missing or the wrong type, rather than
booting into a broken state.

| Name | Description | Example |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | HTTP port the server listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/inventory_management` |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window, in ms | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window per IP | `100` |
| `LOG_LEVEL` | winston log level | `info` |

## API Documentation

- **Swagger UI:** with the server running, open `http://localhost:5000/api-docs`.
- **Postman collection:** [`postman/inventory-api.postman_collection.json`](postman/inventory-api.postman_collection.json)
  — includes every endpoint plus a couple of pre-filled failure cases (missing
  `name`, negative `price`) so validation is visible immediately.

### curl examples

Create a product:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse","category":"Electronics","price":25.99,"quantity":42}'
```

Search + filter:

```bash
curl "http://localhost:5000/api/products?search=lap&category=Electronics&status=lowStock"
```

Dashboard statistics:

```bash
curl http://localhost:5000/api/dashboard
```

## API Reference

Base path: `/api`. Every response uses a consistent envelope:

```jsonc
// success
{ "success": true, "data": /* payload */, "message": "..." }

// error (errors[] present only for validation failures)
{ "success": false, "message": "...", "errors": [{ "field": "price", "message": "Price must be >= 0" }] }
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | Create a product |
| GET | `/api/products` | List products (`search`, `category`, `status`, `page`, `limit`, `sortBy`, `order`) |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| PATCH | `/api/products/:id/quantity` | Set absolute quantity (`{quantity}`) or apply a relative change (`{operation, amount}`) |
| GET | `/api/dashboard` | Aggregate inventory statistics |
| GET | `/api/health` | Liveness check (server + DB connection) |

`status` accepts `inStock` / `lowStock` / `outOfStock` and is translated server-side
into the matching `quantity` range — it is never filtered in application code.

Dashboard response shape:

```json
{
  "totalProducts": 25,
  "totalQuantity": 450,
  "lowStockCount": 6,
  "outOfStockCount": 2,
  "totalInventoryValue": 187650,
  "categoryBreakdown": [{ "category": "Electronics", "count": 10 }]
}
```

`totalInventoryValue` and `categoryBreakdown` are additional metrics beyond the
core 4 required stats (`totalProducts`, `totalQuantity`, `lowStockCount`,
`outOfStockCount`).

## Deployment (optional)

The app reads `PORT` from the environment (never hardcoded), tolerates a hosted
`MONGODB_URI` (e.g. Atlas) as-is, and `/api/health` is suitable as a platform health
check. To deploy to Render or Railway with MongoDB Atlas:

1. Create a free Atlas cluster and get its connection string.
2. Create a new web service from this repo, root directory `backend`.
3. Build command: `npm ci`. Start command: `npm start`.
4. Set environment variables: `NODE_ENV=production`, `MONGODB_URI=<Atlas URI>`,
   `CORS_ORIGIN=<your frontend origin>`, `RATE_LIMIT_WINDOW_MS=900000`,
   `RATE_LIMIT_MAX=100`, `LOG_LEVEL=info`. Leave `PORT` unset — the host injects it.
5. Set the health check path to `/api/health`.
