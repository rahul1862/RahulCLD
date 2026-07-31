const API_URL = (process.env.API_URL || "https://backend-api-haz9.onrender.com").replace(
  /\/+$/,
  ""
);
const WEB_URL = (process.env.WEB_URL || "https://userhub-web.onrender.com").replace(/\/+$/, "");
const EMAIL = process.env.ADMIN_EMAIL || "admin@userhub.dev";
const PASSWORD = process.env.ADMIN_PASSWORD || "userhub-demo";
const TIMEOUT = Number(process.env.SMOKE_TIMEOUT || 30000);
const results = [];
const record = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const req = (url, opts) =>
  fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    ...opts,
  });
console.log(`\nSmoke testing deployed app`);
console.log(`  API: ${API_URL}`);
console.log(`  Web: ${WEB_URL}\n`);
try {
  const res = await req(WEB_URL);
  const body = await res.text();
  record("web app serves the SPA shell", res.ok && /id="root"/.test(body), `HTTP ${res.status}`);
} catch (err) {
  record("web app serves the SPA shell", false, err.message);
}
try {
  const res = await req(`${API_URL}/`);
  const body = await res.json();
  record("API root responds ok", res.ok && body.status === "ok", `HTTP ${res.status}`);
} catch (err) {
  record("API root responds ok", false, err.message);
}
try {
  const res = await req(`${API_URL}/health`);
  const body = await res.json().catch(() => ({}));
  record(
    "API /health is healthy",
    res.status === 200 && body.status === "healthy",
    `HTTP ${res.status}`
  );
} catch (err) {
  record("API /health is healthy", false, err.message);
}
try {
  const res = await req(`${API_URL}/api/users`);
  record("protected route rejects anonymous access", res.status === 401, `HTTP ${res.status}`);
} catch (err) {
  record("protected route rejects anonymous access", false, err.message);
}
let token = null;
try {
  const res = await req(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });
  const body = await res.json().catch(() => ({}));
  token = body.token;
  record(
    "login returns a JWT for demo credentials",
    res.status === 200 && !!token,
    `HTTP ${res.status}`
  );
} catch (err) {
  record("login returns a JWT for demo credentials", false, err.message);
}
if (token) {
  try {
    const res = await req(`${API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const body = await res.json().catch(() => null);
    record(
      "authenticated GET /api/users returns a list",
      res.status === 200 && Array.isArray(body),
      `HTTP ${res.status}`
    );
  } catch (err) {
    record("authenticated GET /api/users returns a list", false, err.message);
  }
} else {
  record("authenticated GET /api/users returns a list", false, "no token from login");
}
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
