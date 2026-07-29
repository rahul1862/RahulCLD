import { test } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");
const { default: request } = await import("supertest");
const { loginToken, authedApi } = await import("../helpers/auth.js");
const api = authedApi(app, await loginToken(app));

test("server responds with status ok", async () => {
  const res = await request(app).get("/");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
});

test("health check reports healthy", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "healthy");
});

test("protected route rejects an unauthenticated request with 401", async () => {
  const res = await request(app).get("/api/users");
  assert.equal(res.status, 401);
});

test("GET /api/users returns an array", async () => {
  const res = await api.get("/api/users");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test("GET /api/stats responds", async () => {
  const res = await api.get("/api/stats");
  assert.equal(res.status, 200);
  assert.ok("total" in res.body);
});

test("GET /api/user/unknown returns 404", async () => {
  const res = await api.get("/api/user/does-not-exist");
  assert.equal(res.status, 404);
});

test("GET /api/transactions returns an array", async () => {
  const res = await api.get("/api/transactions");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test("GET /api/pnl responds", async () => {
  const res = await api.get("/api/pnl");
  assert.equal(res.status, 200);
  assert.ok("netProfit" in res.body);
});
