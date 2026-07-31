import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
process.env.NODE_ENV = "test";
process.env.ALLOW_REGISTRATION = "false";
const { default: app } = await import("../../appFactory.js");
test("POST /api/auth/register is rejected with 403 when ALLOW_REGISTRATION=false", async () => {
  const res = await request(app).post("/api/auth/register").send({
    email: "blocked@example.com",
    password: "password123",
  });
  assert.equal(res.status, 403);
  assert.match(res.body.message, /disabled/i);
});
test("login still works while registration is disabled", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "admin@userhub.dev",
    password: "userhub-demo",
  });
  assert.equal(res.status, 200);
});
