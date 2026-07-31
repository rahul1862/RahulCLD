import { describe, expect, test } from "vitest";
import {
  initials,
  fmtDate,
  avatarColor,
  validateUser,
  fmtCurrency,
  validateTransaction,
} from "./helpers";
describe("initials", () => {
  test("takes the first letter of the first two words", () => {
    expect(initials("Alice Smith")).toBe("AS");
  });
  test("uppercases single-word names", () => {
    expect(initials("alice")).toBe("A");
  });
  test("returns an empty string for no input", () => {
    expect(initials()).toBe("");
  });
});
describe("fmtDate", () => {
  test("formats an ISO string as day month year", () => {
    expect(fmtDate("2026-03-05T12:00:00.000Z")).toBe("5 Mar 2026");
  });
});
describe("avatarColor", () => {
  test("is deterministic for the same name", () => {
    expect(avatarColor("Alice Smith")).toBe(avatarColor("Alice Smith"));
  });
  test("returns one of the known palette classes", () => {
    expect(avatarColor("Alice Smith")).toMatch(/^bg-\w+-100/);
  });
});
describe("validateUser", () => {
  test("flags a name shorter than 2 characters", () => {
    const { valid, errors } = validateUser({
      name: "A",
      email: "a@b.com",
      address: "123 Main Street",
    });
    expect(valid).toBe(false);
    expect(errors.name).toBeTruthy();
  });
  test("flags a malformed email", () => {
    const { valid, errors } = validateUser({
      name: "Alice Smith",
      email: "nope",
      address: "123 Main Street",
    });
    expect(valid).toBe(false);
    expect(errors.email).toBeTruthy();
  });
  test("flags an address shorter than 5 characters", () => {
    const { valid, errors } = validateUser({
      name: "Alice Smith",
      email: "alice@example.com",
      company: "Acme Corp",
      address: "Rd",
    });
    expect(valid).toBe(false);
    expect(errors.address).toBeTruthy();
  });
  test("flags a missing company name", () => {
    const { valid, errors } = validateUser({
      name: "Alice Smith",
      email: "alice@example.com",
      company: "",
      address: "123 Main Street",
    });
    expect(valid).toBe(false);
    expect(errors.company).toBeTruthy();
  });
  test("is valid when every field passes", () => {
    const { valid, errors } = validateUser({
      name: "Alice Smith",
      email: "alice@example.com",
      company: "Acme Corp",
      address: "123 Main Street",
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });
});
describe("fmtCurrency", () => {
  test("formats a number as euro currency", () => {
    const out = fmtCurrency(1234.5);
    expect(out).toContain("€");
    expect(out).toContain("1,234.50");
  });
  test("treats null/undefined as zero", () => {
    expect(fmtCurrency()).toContain("0.00");
    expect(fmtCurrency(null)).toContain("0.00");
  });
});
describe("validateTransaction", () => {
  test("rejects a type that is not income or expense", () => {
    const { valid, errors } = validateTransaction({
      type: "refund",
      category: "Hosting",
      amount: 10,
      date: "2026-01-01",
    });
    expect(valid).toBe(false);
    expect(errors.type).toBeTruthy();
  });
  test("rejects a category shorter than 2 characters", () => {
    const { errors } = validateTransaction({
      type: "income",
      category: "x",
      amount: 10,
      date: "2026-01-01",
    });
    expect(errors.category).toBeTruthy();
  });
  test("rejects a non-positive or non-numeric amount", () => {
    expect(
      validateTransaction({
        type: "income",
        category: "Fees",
        amount: -1,
        date: "2026-01-01",
      }).errors.amount
    ).toBeTruthy();
    expect(
      validateTransaction({
        type: "income",
        category: "Fees",
        amount: "abc",
        date: "2026-01-01",
      }).errors.amount
    ).toBeTruthy();
    expect(
      validateTransaction({
        type: "income",
        category: "Fees",
        amount: "",
        date: "2026-01-01",
      }).errors.amount
    ).toBeTruthy();
  });
  test("rejects an invalid date", () => {
    const { errors } = validateTransaction({
      type: "income",
      category: "Fees",
      amount: 10,
      date: "not-a-date",
    });
    expect(errors.date).toBeTruthy();
  });
  test("is valid for a well-formed transaction", () => {
    const { valid, errors } = validateTransaction({
      type: "expense",
      category: "Hosting",
      amount: 25,
      date: "2026-01-01",
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });
});
