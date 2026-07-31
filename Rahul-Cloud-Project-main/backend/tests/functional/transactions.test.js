import { test } from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
const { default: app } = await import("../../appFactory.js");
const { loginToken, authedApi } = await import("../helpers/auth.js");
const api = authedApi(app, await loginToken(app));
test("POST /api/transaction creates a transaction, GET /api/transaction/:id returns it", async () => {
  const create = await api.post("/api/transaction").send({
    type: "income",
    category: "Subscriptions",
    description: "Test plan",
    amount: 100,
    date: "2026-01-05",
  });
  assert.equal(create.status, 201);
  assert.equal(create.body.category, "Subscriptions");
  assert.ok(create.body._id);
  const get = await api.get(`/api/transaction/${create.body._id}`);
  assert.equal(get.status, 200);
  assert.equal(get.body.amount, 100);
});
test("POST /api/transaction rejects invalid payloads with field errors", async () => {
  const res = await api.post("/api/transaction").send({
    type: "refund",
    category: "x",
    amount: -5,
    date: "not-a-date",
  });
  assert.equal(res.status, 400);
  assert.ok(res.body.message);
});
test("GET /api/transactions includes a newly created transaction", async () => {
  const created = await api.post("/api/transaction").send({
    type: "expense",
    category: "Hosting",
    amount: 25,
    date: "2026-01-10",
  });
  const list = await api.get("/api/transactions");
  assert.equal(list.status, 200);
  assert.ok(list.body.some((t) => t._id === created.body._id));
});
test("PUT /api/update/transaction/:id updates an existing transaction", async () => {
  const created = await api.post("/api/transaction").send({
    type: "income",
    category: "Setup fees",
    amount: 200,
    date: "2026-01-12",
  });
  const updated = await api.put(`/api/update/transaction/${created.body._id}`).send({
    type: "income",
    category: "Setup fees",
    amount: 250,
    date: "2026-01-12",
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.amount, 250);
});
test("PUT /api/update/transaction/:id returns 404 for an unknown id", async () => {
  const res = await api.put("/api/update/transaction/does-not-exist").send({
    type: "income",
    category: "Setup fees",
    amount: 250,
    date: "2026-01-12",
  });
  assert.equal(res.status, 404);
});
test("DELETE /api/delete/transaction/:id removes a transaction", async () => {
  const created = await api.post("/api/transaction").send({
    type: "expense",
    category: "Software",
    amount: 12,
    date: "2026-01-15",
  });
  const del = await api.delete(`/api/delete/transaction/${created.body._id}`);
  assert.equal(del.status, 200);
  const get = await api.get(`/api/transaction/${created.body._id}`);
  assert.equal(get.status, 404);
});
test("GET /api/pnl returns aggregate income, expense and net profit", async () => {
  await api.post("/api/transaction").send({
    type: "income",
    category: "Subscriptions",
    amount: 500,
    date: "2026-02-01",
  });
  await api.post("/api/transaction").send({
    type: "expense",
    category: "Hosting",
    amount: 100,
    date: "2026-02-01",
  });
  const res = await api.get("/api/pnl");
  assert.equal(res.status, 200);
  assert.ok(res.body.totalIncome >= 500);
  assert.ok(res.body.totalExpense >= 100);
  assert.equal(res.body.netProfit, res.body.totalIncome - res.body.totalExpense);
  assert.ok("Subscriptions" in res.body.byCategory);
  assert.ok(Array.isArray(res.body.byMonth));
});
