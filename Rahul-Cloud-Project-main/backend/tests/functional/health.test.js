import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");
test("GET /health reports a healthy status with metadata", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "healthy");
  assert.ok(typeof res.body.uptime === "number");
  assert.ok(res.body.timestamp);
});
test("GET /ready reports readiness", async () => {
  const res = await request(app).get("/ready");
  assert.equal(res.status, 200);
  assert.equal(res.body.ready, true);
});
test("GET /live reports liveness with the process id", async () => {
  const res = await request(app).get("/live");
  assert.equal(res.status, 200);
  assert.equal(res.body.alive, true);
  assert.ok(typeof res.body.pid === "number");
});
test("health endpoints are not rate limited or auth gated", async () => {
  for (let i = 0; i < 3; i++) {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
  }
});
