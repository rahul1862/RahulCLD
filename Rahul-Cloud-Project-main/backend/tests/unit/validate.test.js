import { test } from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
const { validate, validateTransaction } = await import("../../appFactory.js");
test("validate rejects a name shorter than 2 characters", () => {
  const errors = validate({
    name: "A",
    email: "a@b.com",
    address: "123 Main Street",
  });
  assert.equal(errors.name, "Must be at least 2 characters");
});
test("validate rejects a malformed email", () => {
  const errors = validate({
    name: "Alice Smith",
    email: "not-an-email",
    address: "123 Main Street",
  });
  assert.ok(errors.email);
});
test("validate rejects an address shorter than 5 characters", () => {
  const errors = validate({
    name: "Alice Smith",
    email: "alice@example.com",
    address: "Rd",
  });
  assert.ok(errors.address);
});
test("validate rejects a missing company name", () => {
  const errors = validate({
    name: "Alice Smith",
    email: "alice@example.com",
    address: "123 Main Street",
    company: "",
  });
  assert.ok(errors.company);
});
test("validate returns no errors for valid input", () => {
  const errors = validate({
    name: "Alice Smith",
    email: "alice@example.com",
    address: "123 Main Street",
    company: "Acme Corp",
  });
  assert.deepEqual(errors, {});
});
test("validateTransaction rejects a type that isn't income or expense", () => {
  const errors = validateTransaction({
    type: "refund",
    category: "Hosting",
    amount: 10,
    date: "2026-01-01",
  });
  assert.ok(errors.type);
});
test("validateTransaction rejects a non-positive amount", () => {
  const errors = validateTransaction({
    type: "expense",
    category: "Hosting",
    amount: 0,
    date: "2026-01-01",
  });
  assert.ok(errors.amount);
});
test("validateTransaction rejects an invalid date", () => {
  const errors = validateTransaction({
    type: "expense",
    category: "Hosting",
    amount: 10,
    date: "not-a-date",
  });
  assert.ok(errors.date);
});
test("validateTransaction returns no errors for valid input", () => {
  const errors = validateTransaction({
    type: "income",
    category: "Subscriptions",
    amount: 100,
    date: "2026-01-01",
  });
  assert.deepEqual(errors, {});
});
