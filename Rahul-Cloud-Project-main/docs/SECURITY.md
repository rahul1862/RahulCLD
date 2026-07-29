# Security

## Authentication (JWT)

- **Login:** `POST /api/auth/login` with `{ email, password }` returns `{ token, user }`. Passwords are verified against a **bcrypt** hash (`backend/lib/auth.js`).
- **Registration:** `POST /api/auth/register` with `{ email, password }` creates a new account (role `user`) and returns `{ token, user }`, same shape as login. Email must be well-formed and unique; password must be ≥8 characters (bcrypt-hashed, same as the seeded admin). Gated behind its own rate limiter (10 accounts / IP / hour) and can be switched off entirely with `ALLOW_REGISTRATION=false` (returns `403`) for a locked-down, admin-only deployment.
- **Tokens:** JSON Web Tokens signed with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN` (default 8h). The payload carries `sub`, `email`, and `role` — never the password hash.
- **Guard:** `requireAuth` middleware validates `Authorization: Bearer <jwt>` on every `/api/*` route except login/register. Missing/invalid/expired tokens get a `401`.
- **Current user:** `GET /api/auth/me` returns the authenticated user (used by the client to validate a persisted token on refresh).
- **Public surface:** only `/health`, `/ready`, `/live`, `POST /api/auth/login`, and `POST /api/auth/register` are reachable without a token.
- **No role-based access control** — every authenticated account (seeded admin or self-registered) has identical API access today; `role` is stored but nothing currently branches on it.

The demo admin (`admin@userhub.dev` / `userhub-demo`) is seeded on first boot from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. **Override these and `JWT_SECRET` in any real deployment** — the code warns on startup if `JWT_SECRET` is unset in production.

### Client side

The Axios client (`frontend/src/services/api.js`) injects the token on every request and, on any `401`, clears the stored token and emits an `auth:unauthorized` event. `AuthContext` listens for it and drops the session; `ProtectedRoute` then redirects to `/login`. Tokens are stored in `localStorage` under `userhub_token`.

## Transport & header hardening

- **Helmet** sets a baseline of secure headers, supplemented with explicit `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Referrer-Policy` (`backend/middleware/security.js`).
- **CORS** is enabled on the API.

## Rate limiting

- **API limiter** — 100 requests / 15 min per IP on `/api/*` (health probes exempt).
- **Auth limiter** — a stricter 30 requests / 15 min on `POST /api/auth/login` to blunt credential brute-forcing.
- **Register limiter** — 10 accounts / IP / hour on `POST /api/auth/register` to blunt signup spam/abuse on the public demo.

All three use `express-rate-limit`. The API limiter can be bypassed with `RATE_LIMIT_DISABLED=true` for load testing only.

## Input & payload validation

- Request bodies are capped at 10 KB (`413` beyond that).
- All user and transaction writes are validated server-side (`middleware/app.js`); the same rules are mirrored client-side for UX.
- All SQL uses **parameterised statements** (`pg` query parameters, `?` rewritten to `$1, $2, ...`) — no string-concatenated queries.
- Errors are logged with full context but the client only receives a generic message in production (`backend/logger.js`).

## Automated security scanning

| Tool | Where | Policy |
|---|---|---|
| **`npm audit`** (`--audit-level=high`) | `ci.yml`, both packages | Informational (warn) |
| **CodeQL** (SAST) | `codeql.yml` — push, PR, weekly | Reports to Security tab |
| **Dependency Review** | `dependency-review.yml` — on PRs | Informational (warn) |
| **`eslint-plugin-jsx-a11y`** | frontend lint | Blocking |

Audits are informational so that a new upstream advisory can't block merges without a code change, while still surfacing the finding. CodeQL and dependency review provide the deeper SAST / supply-chain coverage.

## Known limitations / future hardening

- **No password reset** — self-registration exists, but there's no "forgot password" flow; add one (email-based token) before relying on this for real user accounts.
- **No role-based access control** — `role` is stored (`admin` for the seeded account, `user` for self-registrations) but every authenticated request has identical access; add authorization checks before that distinction needs to mean something.
- **Open registration** — `POST /api/auth/register` is public by default, appropriate for a demo. For a private deployment, set `ALLOW_REGISTRATION=false` and provision accounts directly, or add an invite-code gate.
- **`localStorage` tokens** — convenient and XSS is mitigated by React's escaping + the strict headers, but httpOnly cookies would be stronger against token theft.
- **Persistence** — see [PERSISTENCE.md](PERSISTENCE.md) for how the Postgres setup works across local dev, tests, and Render.
