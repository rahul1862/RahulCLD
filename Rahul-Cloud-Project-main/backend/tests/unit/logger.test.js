import { test } from "node:test";
import assert from "node:assert/strict";
import { log, errorLogger } from "../../logger.js";
test("log helpers accept a message and optional data without throwing", () => {
  assert.doesNotThrow(() =>
    log.info("info message", {
      a: 1,
    })
  );
  assert.doesNotThrow(() => log.warn("warn message"));
  assert.doesNotThrow(() =>
    log.error("error message", {
      code: "E",
    })
  );
  assert.doesNotThrow(() => log.debug("debug message"));
});
const fakeReqRes = () => {
  let statusCode;
  let payload;
  const req = {
    method: "GET",
    path: "/boom",
    body: {},
    query: {},
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return this;
    },
  };
  return {
    req,
    res,
    get: () => ({
      statusCode,
      payload,
    }),
  };
};
test("errorLogger responds with the error's status and message outside production", () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const { req, res, get } = fakeReqRes();
  const err = Object.assign(new Error("something specific broke"), {
    status: 422,
  });
  errorLogger(err, req, res, () => {});
  const { statusCode, payload } = get();
  assert.equal(statusCode, 422);
  assert.equal(payload.error, "something specific broke");
  process.env.NODE_ENV = prev;
});
test("errorLogger masks the message and defaults to 500 in production", () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const { req, res, get } = fakeReqRes();
  errorLogger(new Error("leaky internal detail"), req, res, () => {});
  const { statusCode, payload } = get();
  assert.equal(statusCode, 500);
  assert.equal(payload.error, "Internal server error");
  process.env.NODE_ENV = prev;
});
