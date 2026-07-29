import { test } from "node:test";
import assert from "node:assert/strict";
import { generateUserPdf } from "../../lib/pdfExport.js";

test("generateUserPdf returns a valid PDF buffer", async () => {
  const buffer = await generateUserPdf({
    name: "Alice Smith",
    email: "alice@example.com",
    company: "Acme Corp",
    address: "123 Main Street",
    phone: "+353 87 000 0000",
    createdAt: "2026-01-01T00:00:00.000Z",
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 0);
  assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
});

test("generateUserPdf omits empty optional fields without throwing", async () => {
  const buffer = await generateUserPdf({
    name: "Bob Jones",
    email: "bob@example.com",
    address: "456 Side Street",
    phone: "",
    createdAt: "2026-01-01T00:00:00.000Z",
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
});
