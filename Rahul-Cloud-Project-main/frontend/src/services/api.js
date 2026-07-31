import axios from "axios";
const TOKEN_KEY = "userhub_token";
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 10000,
});
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      setToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    const msg =
      err.response?.data?.message ||
      err.response?.data?.errorMessage ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);
export const authService = {
  login: (email, password) =>
    http
      .post("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),
  register: (email, password) =>
    http
      .post("/auth/register", {
        email,
        password,
      })
      .then((r) => r.data),
  me: () => http.get("/auth/me").then((r) => r.data),
};
export const userService = {
  getAll: () => http.get("/users").then((r) => r.data),
  getById: (id) => http.get(`/user/${id}`).then((r) => r.data),
  create: (data) => http.post("/user", data).then((r) => r.data),
  update: (id, d) => http.put(`/update/user/${id}`, d).then((r) => r.data),
  remove: (id) => http.delete(`/delete/user/${id}`).then((r) => r.data),
  stats: () => http.get("/stats").then((r) => r.data),
  search: (q) =>
    http
      .get("/search", {
        params: {
          q,
        },
      })
      .then((r) => r.data),
  downloadPdf: (id, filename) =>
    http
      .get(`/user/${id}/pdf`, {
        responseType: "blob",
      })
      .then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "profile.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }),
};
export const transactionService = {
  getAll: () => http.get("/transactions").then((r) => r.data),
  getById: (id) => http.get(`/transaction/${id}`).then((r) => r.data),
  create: (data) => http.post("/transaction", data).then((r) => r.data),
  update: (id, d) => http.put(`/update/transaction/${id}`, d).then((r) => r.data),
  remove: (id) => http.delete(`/delete/transaction/${id}`).then((r) => r.data),
  pnl: () => http.get("/pnl").then((r) => r.data),
};
export default http;
