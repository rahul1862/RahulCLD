import request from "supertest";

// Demo admin seeded by ensureAuthSchema() when no ADMIN_EMAIL/ADMIN_PASSWORD are set.
export const DEMO_CREDENTIALS = { email: "admin@userhub.dev", password: "userhub-demo" };

/** Log in as the seeded admin and return a bearer token. */
export async function loginToken(app) {
  const res = await request(app).post("/api/auth/login").send(DEMO_CREDENTIALS);
  if (res.status !== 200) throw new Error(`Test login failed (${res.status})`);
  return res.body.token;
}

/** A thin supertest wrapper that pre-attaches the Authorization header on every verb. */
export function authedApi(app, token) {
  const bearer = `Bearer ${token}`;
  return {
    get: (p) => request(app).get(p).set("Authorization", bearer),
    post: (p) => request(app).post(p).set("Authorization", bearer),
    put: (p) => request(app).put(p).set("Authorization", bearer),
    delete: (p) => request(app).delete(p).set("Authorization", bearer),
  };
}
