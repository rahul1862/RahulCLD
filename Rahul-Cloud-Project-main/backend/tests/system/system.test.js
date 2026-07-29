import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "../../");
const PORT = 8099;
const BASE_URL = `http://localhost:${PORT}`;

let child;
let token;

const authJson = (extra = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  ...extra,
});

const waitForServer = async (timeoutMs = 10000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {
      // server not up yet, keep polling
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
};

before(async () => {
  child = spawn(process.execPath, ["--no-warnings", "index.js"], {
    cwd: serverRoot,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "test" },
    stdio: "ignore",
  });
  await waitForServer();

  const login = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@userhub.dev", password: "userhub-demo" }),
  });
  assert.equal(login.status, 200);
  token = (await login.json()).token;
  assert.ok(token, "expected a login token");
});

after(() => {
  child.kill();
});

test("GET / reports the service is running", async () => {
  const res = await fetch(BASE_URL);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("unauthenticated requests to the API are rejected with 401", async () => {
  const res = await fetch(`${BASE_URL}/api/users`);
  assert.equal(res.status, 401);
});

test("full user lifecycle over real HTTP against the running process", async () => {
  const create = await fetch(`${BASE_URL}/api/user`, {
    method: "POST",
    headers: authJson(),
    body: JSON.stringify({
      name: "System Test User",
      email: "system.test@example.com",
      company: "Acme Corp",
      address: "123 Main Street",
      phone: "+353 87 000 0000",
    }),
  });
  assert.equal(create.status, 201);
  const created = await create.json();
  assert.ok(created._id);

  const get = await fetch(`${BASE_URL}/api/user/${created._id}`, { headers: authJson() });
  assert.equal(get.status, 200);

  const list = await fetch(`${BASE_URL}/api/users`, { headers: authJson() });
  const users = await list.json();
  assert.ok(users.some((u) => u._id === created._id));

  const update = await fetch(`${BASE_URL}/api/update/user/${created._id}`, {
    method: "PUT",
    headers: authJson(),
    body: JSON.stringify({
      name: "System Test User Updated",
      email: "system.test@example.com",
      company: "Acme Corp",
      address: "456 New Street",
    }),
  });
  assert.equal(update.status, 200);
  const updated = await update.json();
  assert.equal(updated.name, "System Test User Updated");

  const pdf = await fetch(`${BASE_URL}/api/user/${created._id}/pdf`, { headers: authJson() });
  assert.equal(pdf.status, 200);
  assert.equal(pdf.headers.get("content-type"), "application/pdf");

  const del = await fetch(`${BASE_URL}/api/delete/user/${created._id}`, {
    method: "DELETE",
    headers: authJson(),
  });
  assert.equal(del.status, 200);

  const getAfterDelete = await fetch(`${BASE_URL}/api/user/${created._id}`, { headers: authJson() });
  assert.equal(getAfterDelete.status, 404);
});
