# Deployment & CI/CD

## Hosting

Both services run on [Render](https://render.com), configured declaratively in [`render.yaml`](../render.yaml):

| Service | Type | Root | URL |
|---|---|---|---|
| `backend-api` | Node web service | `backend/` | https://backend-api-haz9.onrender.com |
| `userhub-web` | Static site | `frontend/` | https://userhub-web.onrender.com |

The backend builds with `npm install` and starts with `npm start`; Render polls `/health` for readiness. The frontend builds with `npm install && npm run build` and serves `dist/` with an SPA rewrite (`/* → /index.html`). `autoDeploy` is off — deploys are triggered by CI (below).

## CI/CD pipeline

Defined in [`.github/workflows/`](../.github/workflows/). Runs on every push and pull request to `main`.

### `ci.yml`

```
backend  ─┐
frontend ─┴─▶ deploy (main only) ─▶ post-deploy-smoke
```

**backend** and **frontend** jobs (run in parallel):

1. Install dependencies (`npm ci` / `npm install`)
2. **Lint** — ESLint, **blocking** (frontend also runs `jsx-a11y`)
3. **Format check** — Prettier, informational (non-blocking)
4. **Test tiers** — each tier run as its own step so results are individually visible
5. Frontend also runs the **accessibility** tier (axe-core)
6. **Coverage** — c8 / v8, **blocking below 80%**
7. **Security audit** — `npm audit --audit-level=high`, informational (non-blocking)
8. Frontend **build**
9. Upload the coverage report as a run artifact

**deploy** (only on push to `main`, after both jobs pass): POSTs the Render deploy hooks (`RENDER_BACKEND_DEPLOY_HOOK`, `RENDER_FRONTEND_DEPLOY_HOOK` secrets).

**post-deploy-smoke** (after deploy): polls `/health` until the API is back up, then runs `backend/scripts/smoke-deployed.js` against the live URLs. This job is `continue-on-error` — it is **automated deployment evidence**, not a gate (free-tier cold starts are slow and shouldn't fail the pipeline).

### `codeql.yml`

CodeQL **static application security testing** (SAST) on the JavaScript/JSX source. Runs on push, PR, and weekly. Findings appear in the repo **Security** tab.

### `dependency-review.yml`

Scans PRs for newly-introduced known-vulnerable dependencies (OWASP-style) and comments a summary. Informational (non-blocking), matching the project's audit policy.

## Deploying manually

```bash
# From a machine with the Render deploy-hook URLs:
curl -fsS -X POST "$RENDER_BACKEND_DEPLOY_HOOK"
curl -fsS -X POST "$RENDER_FRONTEND_DEPLOY_HOOK"
```

Or push to `main` and let CI deploy after the gates pass.

### Required configuration

- **GitHub secrets:** `RENDER_BACKEND_DEPLOY_HOOK`, `RENDER_FRONTEND_DEPLOY_HOOK`.
- **GitHub variables (optional):** `API_URL`, `WEB_URL` — override the smoke-test targets (defaults point at the live URLs).
- **Render backend env:** `JWT_SECRET` (auto-generated), `ADMIN_EMAIL`, and — for a private deployment — `ADMIN_PASSWORD`.
- **Render frontend env:** `VITE_API_URL` set to the backend's `/api` URL.

## Verifying a deployment

```bash
cd backend
npm run smoke:deployed
# or against a custom target:
API_URL=https://my-api.onrender.com WEB_URL=https://my-web.onrender.com npm run smoke:deployed
```

The smoke test checks: the web SPA loads, the API root and `/health` respond, protected routes reject anonymous access (401), demo login returns a JWT, and that token unlocks an authenticated read. It exits non-zero if any check fails and prints a `PASS/FAIL` line per check.

## Viewing CI evidence

- **Actions tab** → pick a run → each job shows every lint/test/coverage step with a green ✓ (or red ✗).
- **Run summary** → download the `backend-coverage` / `frontend-coverage` artifacts for the HTML coverage report.
- **Security tab** → CodeQL alerts and the dependency-review results.

## Zero-downtime / blue-green

Render performs **rolling deploys** with a health-gated cutover: a new instance is built and must pass the `/health` check before traffic shifts, and the old instance is only retired afterward — so a failed deploy never takes the live site down. True **blue-green** (a warm idle "green" environment promoted instantly) and **preview environments per PR** require a paid Render plan; the `render.yaml` is structured so that enabling them is a plan change, not a code change. The `post-deploy-smoke` job provides the verification half of a safe-cutover strategy today.
