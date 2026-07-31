import { test } from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");
const { loginToken, authedApi, DEMO_CREDENTIALS } = await import("../helpers/auth.js");
const { default: request } = await import("supertest");
const token = await loginToken(app);
const api = authedApi(app, token);
const hasKeys = (obj, keys) => keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
test("login response matches what AuthContext expects: { token, user:{id,email,role} }", async () => {
  const res = await request(app).post("/api/auth/login").send(DEMO_CREDENTIALS);
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.token, "string");
  assert.ok(hasKeys(res.body.user, ["id", "email", "role"]));
  assert.ok(!("passwordHash" in res.body.user));
});
test("a created user echoes the _id + fields the frontend reads", async () => {
  const res = await api.post("/api/user").send({
    name: "Contract User",
    email: "contract.user@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
    phone: "+353 87 000 0000",
  });
  assert.equal(res.status, 201);
  assert.ok(
    hasKeys(res.body, ["_id", "name", "email", "company", "address", "phone", "createdAt"])
  );
});
test("GET /api/users returns an array of the user shape the table renders", async () => {
  const res = await api.get("/api/users");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
  assert.ok(hasKeys(res.body[0], ["_id", "name", "email", "company", "address", "createdAt"]));
});
test("GET /api/stats returns the dashboard shape", async () => {
  const res = await api.get("/api/stats");
  assert.equal(res.status, 200);
  assert.ok(hasKeys(res.body, ["total", "recentUsers", "growthRate", "domainBreakdown"]));
  assert.equal(typeof res.body.total, "number");
});
test("GET /api/pnl returns the finance summary shape", async () => {
  const res = await api.get("/api/pnl");
  assert.equal(res.status, 200);
  assert.ok(
    hasKeys(res.body, ["totalIncome", "totalExpense", "netProfit", "byCategory", "byMonth"])
  );
  assert.ok(Array.isArray(res.body.byMonth));
});
test("error responses carry a `message` field the client surfaces to the user", async () => {
  const res = await api.post("/api/user").send({
    name: "A",
    email: "bad",
    address: "x",
  });
  assert.equal(res.status, 400);
  assert.equal(typeof res.body.message, "string");
});
