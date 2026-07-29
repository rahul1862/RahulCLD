import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");

const login = (body) => request(app).post("/api/auth/login").send(body);
const register = (body) => request(app).post("/api/auth/register").send(body);

test("POST /api/auth/login returns a token and public user for valid credentials", async () => {
  const res = await login({ email: "admin@userhub.dev", password: "userhub-demo" });
  assert.equal(res.status, 200);
  assert.ok(res.body.token, "expected a JWT token");
  assert.equal(res.body.user.email, "admin@userhub.dev");
  assert.equal(res.body.user.role, "admin");
  assert.ok(!("passwordHash" in res.body.user), "must never leak the password hash");
});

test("login is case-insensitive on the email", async () => {
  const res = await login({ email: "ADMIN@userhub.dev", password: "userhub-demo" });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test("POST /api/auth/login rejects a wrong password with 401", async () => {
  const res = await login({ email: "admin@userhub.dev", password: "nope" });
  assert.equal(res.status, 401);
  assert.ok(!res.body.token);
});

test("POST /api/auth/login rejects an unknown user with 401", async () => {
  const res = await login({ email: "ghost@userhub.dev", password: "userhub-demo" });
  assert.equal(res.status, 401);
});

test("protected route rejects a missing token with 401", async () => {
  const res = await request(app).get("/api/users");
  assert.equal(res.status, 401);
});

test("protected route rejects a malformed/invalid token with 401", async () => {
  const res = await request(app).get("/api/users").set("Authorization", "Bearer not-a-real-token");
  assert.equal(res.status, 401);
});

test("GET /api/auth/me returns the current user for a valid token", async () => {
  const token = (await login({ email: "admin@userhub.dev", password: "userhub-demo" })).body.token;
  const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, "admin@userhub.dev");
});

test("GET /api/auth/me rejects a missing token with 401", async () => {
  const res = await request(app).get("/api/auth/me");
  assert.equal(res.status, 401);
});

test("POST /api/auth/register creates a new account and returns a usable token", async () => {
  const res = await register({ email: "new.signup@example.com", password: "password123" });
  assert.equal(res.status, 201);
  assert.ok(res.body.token, "expected a JWT token");
  assert.equal(res.body.user.email, "new.signup@example.com");
  assert.equal(res.body.user.role, "user");
  assert.ok(!("passwordHash" in res.body.user), "must never leak the password hash");

  // the returned token should immediately unlock a protected route
  const authed = await request(app).get("/api/users").set("Authorization", `Bearer ${res.body.token}`);
  assert.equal(authed.status, 200);
});

test("a registered account can log in with the credentials it registered with", async () => {
  await register({ email: "roundtrip@example.com", password: "password123" });
  const res = await login({ email: "roundtrip@example.com", password: "password123" });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test("register normalizes email case, so a duplicate signup is rejected with 409", async () => {
  await register({ email: "casetest@example.com", password: "password123" });
  const res = await register({ email: "CaseTest@Example.com", password: "password123" });
  assert.equal(res.status, 409);
  assert.match(res.body.message, /already in use/i);
});

test("POST /api/auth/register rejects a password shorter than 8 characters with 400", async () => {
  const res = await register({ email: "shortpw@example.com", password: "abc123" });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.password);
});

test("POST /api/auth/register rejects a malformed email with 400", async () => {
  const res = await register({ email: "not-an-email", password: "password123" });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.email);
});

test("POST /api/auth/register rejects a duplicate of the seeded admin email with 409", async () => {
  const res = await register({ email: "admin@userhub.dev", password: "password123" });
  assert.equal(res.status, 409);
});
