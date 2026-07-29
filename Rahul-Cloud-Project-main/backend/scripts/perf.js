// Lightweight performance/load test for the API.
//
//   npm run perf                 # 5s load test against GET /api/users
//   PERF_DURATION=10 npm run perf
//
// Boots the Express app in-process on an ephemeral port, authenticates once,
// then drives GET /api/users with autocannon and prints a latency/throughput
// report. Rate limiting is disabled for the run so the limiter doesn't skew
// the numbers (it is fully exercised by the test suite instead).
process.env.RATE_LIMIT_DISABLED = "true";

import autocannon from "autocannon";
import app from "../appFactory.js";

const DURATION = Number(process.env.PERF_DURATION || 5);
const CONNECTIONS = Number(process.env.PERF_CONNECTIONS || 10);
const EMAIL = process.env.ADMIN_EMAIL || "admin@userhub.dev";
const PASSWORD = process.env.ADMIN_PASSWORD || "userhub-demo";

const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const loginRes = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (loginRes.status !== 200) {
  console.error(`Login failed (${loginRes.status}); cannot run authenticated load test.`);
  server.close();
  process.exit(1);
}
const { token } = await loginRes.json();

console.log(`\nLoad testing GET /api/users — ${CONNECTIONS} connections for ${DURATION}s\n`);

const result = await autocannon({
  url: `${base}/api/users`,
  connections: CONNECTIONS,
  duration: DURATION,
  headers: { authorization: `Bearer ${token}` },
});

console.log(autocannon.printResult(result));
console.log(
  `Summary: ${Math.round(result.requests.average)} req/sec avg | ` +
    `latency avg ${result.latency.average}ms p99 ${result.latency.p99}ms | ` +
    `${result.non2xx} non-2xx responses`
);

server.close();
process.exit(result.non2xx > 0 ? 1 : 0);
