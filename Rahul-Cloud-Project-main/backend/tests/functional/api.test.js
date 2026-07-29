import { test } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");
const { loginToken, authedApi } = await import("../helpers/auth.js");
const api = authedApi(app, await loginToken(app));

test("POST /api/user creates a user, GET /api/user/:id returns it", async () => {
  const create = await api.post("/api/user").send({
    name: "Alice Smith",
    email: "alice.create@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
    phone: "+353 87 000 0000",
  });
  assert.equal(create.status, 201);
  assert.equal(create.body.name, "Alice Smith");
  assert.equal(create.body.company, "Acme Corp");
  assert.ok(create.body._id);

  const get = await api.get(`/api/user/${create.body._id}`);
  assert.equal(get.status, 200);
  assert.equal(get.body.email, "alice.create@example.com");
});

test("POST /api/user rejects invalid payloads with field errors", async () => {
  const res = await api.post("/api/user").send({
    name: "A",
    email: "not-an-email",
    address: "x",
  });
  assert.equal(res.status, 400);
  assert.ok(res.body.message);
});

test("POST /api/user rejects a duplicate email with 409", async () => {
  const payload = {
    name: "Dupe One",
    email: "dupe@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  };
  const first = await api.post("/api/user").send(payload);
  assert.equal(first.status, 201);

  const second = await api.post("/api/user").send({ ...payload, name: "Dupe Two" });
  assert.equal(second.status, 409);
});

test("GET /api/users includes a newly created user", async () => {
  const created = await api.post("/api/user").send({
    name: "List Check",
    email: "listcheck@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });
  const list = await api.get("/api/users");
  assert.equal(list.status, 200);
  assert.ok(list.body.some((u) => u._id === created.body._id));
});

test("PUT /api/update/user/:id updates an existing user", async () => {
  const created = await api.post("/api/user").send({
    name: "Update Me",
    email: "updateme@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });

  const updated = await api.put(`/api/update/user/${created.body._id}`).send({
    name: "Updated Name",
    email: "updateme@example.com",
    company: "Acme Corp",
    address: "456 New Street",
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, "Updated Name");
  assert.equal(updated.body.address, "456 New Street");
});

test("PUT /api/update/user/:id returns 404 for an unknown id", async () => {
  const res = await api.put("/api/update/user/does-not-exist").send({
    name: "Nobody",
    email: "nobody@example.com",
    address: "123 Main Street",
  });
  assert.equal(res.status, 404);
});

test("DELETE /api/delete/user/:id removes a user", async () => {
  const created = await api.post("/api/user").send({
    name: "Delete Me",
    email: "deleteme@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });

  const del = await api.delete(`/api/delete/user/${created.body._id}`);
  assert.equal(del.status, 200);

  const get = await api.get(`/api/user/${created.body._id}`);
  assert.equal(get.status, 404);
});

test("GET /api/user/:id/pdf returns a PDF for an existing user", async () => {
  const created = await api.post("/api/user").send({
    name: "Pdf Person",
    email: "pdfperson@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });

  const pdf = await api.get(`/api/user/${created.body._id}/pdf`);
  assert.equal(pdf.status, 200);
  assert.equal(pdf.headers["content-type"], "application/pdf");
  assert.equal(Buffer.from(pdf.body).subarray(0, 5).toString(), "%PDF-");
});

test("GET /api/user/:id/pdf returns 404 for an unknown id", async () => {
  const res = await api.get("/api/user/does-not-exist/pdf");
  assert.equal(res.status, 404);
});

test("GET /api/stats returns aggregate counts", async () => {
  await api.post("/api/user").send({
    name: "Stats Person",
    email: "statsperson@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });

  const res = await api.get("/api/stats");
  assert.equal(res.status, 200);
  assert.ok(res.body.total >= 1);
  assert.ok("domainBreakdown" in res.body);
});

test("GET /api/search filters users by name, email or address", async () => {
  await api.post("/api/user").send({
    name: "Searchable Person",
    email: "searchable@uniquedomain.com",
    company: "Acme Corp",
    address: "123 Main Street",
  });

  const res = await api.get("/api/search").query({ q: "uniquedomain" });
  assert.equal(res.status, 200);
  assert.ok(res.body.some((u) => u.email === "searchable@uniquedomain.com"));
});
