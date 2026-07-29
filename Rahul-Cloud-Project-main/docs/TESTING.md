# Testing

UserHub uses a five-tier automated test strategy on both the backend and the frontend, with enforced coverage thresholds, accessibility checks, and a load test.

## Test tiers

| Tier | What it verifies | Backend tooling | Frontend tooling |
|---|---|---|---|
| **Unit** | Pure functions in isolation (validation, formatting, PDF, logging, token helpers) | `node:test` | Vitest + Testing Library |
| **Integration** | Modules wired to their real collaborators (Postgres layer; Axios client + interceptors) | `node:test` + `pg` | Vitest (mocked transport) |
| **Functional** | HTTP endpoints against the built app, incl. auth (login, 401s, `/me`) and CRUD | `supertest` | Vitest (page + login flows) |
| **Smoke** | The app boots and core routes/health respond | `supertest` | Testing Library (route render) |
| **System** (backend) | Full lifecycle over real HTTP against a spawned server process | `node:child_process` + `fetch` | — |
| **Accessibility** (frontend) | No axe-core violations on forms, dialog and login | — | `vitest-axe` (axe-core) |

### Counts

| Tier | Backend | Frontend |
|---|---|---|
| Unit | 14 | 21 |
| Integration | 11 | 25 |
| Functional | 38 | 13 |
| Smoke | 8 | 3 |
| System / Accessibility | 3 | 4 |
| **Total** | **74** | **66** |

> The backend integration tier includes `contract.test.js` — a **frontend↔backend contract test** that boots the real API and asserts the exact JSON response shapes the React client's services and hooks depend on, so a breaking API change fails in CI instead of in the browser.

## Running the tests

```bash
# Backend (from backend/)
npm test                 # all tiers
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:smoke
npm run test:system
npm run test:coverage    # all tiers + coverage gate (c8)
npm run perf             # autocannon load test

# Frontend (from frontend/)
npm test                 # all tiers
npm run test:unit
npm run test:integration
npm run test:functional
npm run test:smoke
npm run test:a11y        # axe-core accessibility
npm run test:coverage    # all tiers + coverage gate (v8)
```

## Coverage

Coverage is generated on both sides and **gated in CI** — the build fails if coverage drops below threshold.

### Backend (c8)

Configured in [`backend/.c8rc.json`](../backend/.c8rc.json). Scope: `lib/`, `routes/`, `middleware/`, `logger.js`, `db.js`. Thresholds: **80%** statements, lines, functions, and branches.

Latest run:

```
Statements   : 92.45% ( 441/477 )
Branches     : 82.75% ( 72/87 )
Functions    : 100%   ( 22/22 )
Lines        : 92.45% ( 441/477 )
```

The shared API router (`middleware/app.js`) is not in the c8 scope (it lives outside the backend package) but is exercised end-to-end by every functional and system test — each of its routes is driven over real HTTP.

Reports are written to `backend/coverage/` (`lcov`, HTML, `text`, `json-summary`). Open `backend/coverage/index.html` for the line-by-line view.

### Frontend (@vitest/coverage-v8)

Configured in [`frontend/vite.config.js`](../frontend/vite.config.js). The report covers all of `src/`; thresholds are enforced at **80%** on the **critical business-logic paths**:

- `src/services/**` — API client, token injection, 401 handling → **100%** statements/lines/functions, 81% branches
- `src/utils/**` — validation and formatting helpers → **100%**
- `src/context/AuthContext.jsx` — auth state machine → 90% lines, 80% functions

Presentation-only page components are exercised by the smoke and functional suites but are not part of the enforced critical-path gate. Reports are written to `frontend/coverage/`.

## Accessibility testing

Two layers:

1. **Static** — `eslint-plugin-jsx-a11y` runs in the frontend lint step (blocking). It caught, and we fixed, non-native interactive backdrops (now keyboard-accessible buttons) and unlabelled regions.
2. **Runtime** — `vitest-axe` runs axe-core against rendered components (`src/tests/a11y/`). This caught a real bug: an `aria-label` on a role-less `div` in the toast region (now `role="region"`).

## Performance testing

`npm run perf` (backend) boots the app in-process, authenticates, and drives `GET /api/users` with [autocannon](https://github.com/mcollina/autocannon). Example local result (3s, 10 connections):

```
~1,700 req/sec avg | latency avg 5.4ms, p99 12ms | 0 non-2xx
```

Tune with `PERF_DURATION` and `PERF_CONNECTIONS`. The rate limiter is bypassed for the run (`RATE_LIMIT_DISABLED=true`) so it measures the app, not the limiter.

## Where to see the evidence

- **GitHub Actions** → the **Actions** tab shows every tier and gate per run (green ✓ per step).
- **Coverage artifacts** → each CI run uploads `backend-coverage` and `frontend-coverage` artifacts (download from the run summary for the HTML report).
- **Deployed smoke** → the `post-deploy-smoke` job prints PASS/FAIL per check against the live URLs (see [DEPLOYMENT.md](DEPLOYMENT.md)).
