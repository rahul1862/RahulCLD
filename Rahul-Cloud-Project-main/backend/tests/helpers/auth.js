import request from "supertest";
export const DEMO_CREDENTIALS = {
  email: "admin@userhub.dev",
  password: "userhub-demo",
};
export async function loginToken(app) {
  const res = await request(app).post("/api/auth/login").send(DEMO_CREDENTIALS);
  if (res.status !== 200) throw new Error(`Test login failed (${res.status})`);
  return res.body.token;
}
export function authedApi(app, token) {
  const bearer = `Bearer ${token}`;
  return {
    get: (p) => request(app).get(p).set("Authorization", bearer),
    post: (p) => request(app).post(p).set("Authorization", bearer),
    put: (p) => request(app).put(p).set("Authorization", bearer),
    delete: (p) => request(app).delete(p).set("Authorization", bearer),
  };
}
