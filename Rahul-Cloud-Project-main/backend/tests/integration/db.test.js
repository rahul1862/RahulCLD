import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
process.env.NODE_ENV = "test";
const { default: db } = await import("../../db.js");
async function columnsOf(table) {
  const { rows } = await db(
    "SELECT column_name FROM information_schema.columns WHERE table_name = ?",
    [table]
  );
  return rows.map((r) => r.column_name);
}
test("users table exists with the expected schema", async () => {
  const columns = await columnsOf("users");
  assert.deepEqual(
    columns.sort(),
    ["address", "company", "createdAt", "email", "id", "name", "phone"].sort()
  );
});
test("insert then query round-trips a user through the real postgres layer", async () => {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db(
    'INSERT INTO users (id, name, email, company, address, phone, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      "Db Integration",
      "db.integration@example.com",
      "Acme Corp",
      "123 Main Street",
      "+353 87 000 0000",
      createdAt,
    ]
  );
  const { rows } = await db("SELECT * FROM users WHERE id = ?", [id]);
  const row = rows[0];
  assert.equal(row.name, "Db Integration");
  assert.equal(row.email, "db.integration@example.com");
  assert.equal(row.company, "Acme Corp");
  assert.equal(row.createdAt, createdAt);
});
test("email column enforces a unique constraint", async () => {
  const insert = (id, name) =>
    db(
      'INSERT INTO users (id, name, email, company, address, phone, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, "Acme Corp", "123 Main Street", null, new Date().toISOString()]
    );
  const email = "duplicate.integration@example.com";
  await insert(crypto.randomUUID(), "First");
  await assert.rejects(() => insert(crypto.randomUUID(), "Second"));
});
test("transactions table exists with the expected schema", async () => {
  const columns = await columnsOf("transactions");
  assert.deepEqual(
    columns.sort(),
    ["amount", "category", "createdAt", "date", "description", "id", "type"].sort()
  );
});
test("insert then query round-trips a transaction through the real postgres layer", async () => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db(
    'INSERT INTO transactions (id, type, category, description, amount, date, "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, "income", "Subscriptions", "Db integration test", 100, now, now]
  );
  const { rows } = await db("SELECT * FROM transactions WHERE id = ?", [id]);
  const row = rows[0];
  assert.equal(row.type, "income");
  assert.equal(row.amount, 100);
});
