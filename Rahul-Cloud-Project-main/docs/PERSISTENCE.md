# Database & persistence

## Current setup

The API uses **PostgreSQL** via the `pg` client (`backend/db.js`), used consistently in every environment — local dev, tests, and Render.

- `DATABASE_URL` is required and points at the Postgres instance to use.
- Local dev: a Postgres instance running on your machine (see below), pointed at by `backend/.env`.
- Tests (`NODE_ENV=test`): each test file bootstraps its own throwaway database (`userhub_test_<random>`) via a short-lived connection, then runs against it. This keeps every test file isolated even though `node --test` runs files concurrently — the equivalent of the old "fresh in-memory database per file" guarantee, just backed by real Postgres.
- Production: Render's managed Postgres (declared in `render.yaml`'s `databases:` block, injected into `backend-api` as `DATABASE_URL` via `fromDatabase`).

On first boot against an empty database, the `users` and `transactions` tables are created and seeded with demo data, and the `auth_users` table is seeded with the demo admin.

Because `pg` is async, `db.js` exports a single `query(sql, params)` helper (default export) that rewrites SQLite-style `?` placeholders to Postgres's `$1, $2, ...` and returns `{ rows, rowCount }`. Every route handler in `middleware/app.js`, plus `backend/lib/auth.js` and `backend/routes/auth.js`, calls through this helper with `await`.

Two columns (`"createdAt"`, `"passwordHash"`) are declared with quoted identifiers in the `CREATE TABLE` statements specifically to preserve their camelCase spelling — Postgres folds unquoted identifiers to lowercase, which would otherwise silently break every `row.createdAt` / `user.passwordHash` access in the JS layer.

## Local setup

1. Install PostgreSQL (this repo was set up with `winget install -e --id PostgreSQL.PostgreSQL.16`; a native installer from postgresql.org or Docker both work too).
2. Create a database: `psql -U postgres -h localhost -c "CREATE DATABASE userhub;"`
3. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to your local connection string, e.g.:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/userhub
   ```
4. `npm run dev` (or `npm start`) in `backend/` — the app connects, creates tables if missing, and seeds demo data on first run.

## Render deployment

`render.yaml` declares a free managed Postgres instance (`userhub-db`) and wires its connection string into `backend-api` as `DATABASE_URL` via `fromDatabase`. Re-syncing the Render Blueprint provisions the database and sets the env var automatically — no manual dashboard step needed. Data now lives in that managed Postgres instance, not on the web service's filesystem, so it survives redeploys and restarts on the free tier.

## CI

`.github/workflows/ci.yml` runs a `postgres:16` service container alongside the backend test job, with `DATABASE_URL` pointed at it, so the full test suite (including the per-file throwaway-database isolation described above) runs against real Postgres in CI too.

## Backups

Use Render's managed Postgres backup/restore features (available even on the free tier's retention window; upgrade the database plan for longer retention).
