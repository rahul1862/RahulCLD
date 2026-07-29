import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../context/ToastContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

vi.mock("../../services/api", () => ({
  authService: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  userService: {},
}));

const { authService, getToken } = await import("../../services/api");

beforeEach(() => {
  authService.login.mockReset();
  authService.register.mockReset();
  authService.me.mockReset();
  getToken.mockReset().mockReturnValue(null);
});

describe("Login page", () => {
  const renderLogin = () =>
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/login"]}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<div>Dashboard Home</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

  test("submits credentials and redirects on success", async () => {
    authService.login.mockResolvedValue({ token: "jwt-1", user: { email: "admin@userhub.dev", role: "admin" } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@userhub.dev" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "userhub-demo" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith("admin@userhub.dev", "userhub-demo"));
    expect(await screen.findByText("Dashboard Home")).toBeInTheDocument();
  });

  test("shows an error message when login fails", async () => {
    authService.login.mockRejectedValue(new Error("Invalid email or password"));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@userhub.dev" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Home")).not.toBeInTheDocument();
  });
});

describe("Register page", () => {
  const renderRegister = () =>
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/register"]}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<div>Login Screen</div>} />
              <Route path="/" element={<div>Dashboard Home</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

  test("submits a new account and redirects on success", async () => {
    authService.register.mockResolvedValue({ token: "jwt-2", user: { email: "new@example.com", role: "user" } });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(authService.register).toHaveBeenCalledWith("new@example.com", "password123"));
    expect(await screen.findByText("Dashboard Home")).toBeInTheDocument();
  });

  test("rejects a password shorter than 8 characters without calling the API", async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  test("rejects mismatched password confirmation without calling the API", async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "different123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/don't match/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  test("shows a server error, e.g. a duplicate email, without navigating away", async () => {
    authService.register.mockRejectedValue(new Error("Email already in use"));
    renderRegister();

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "admin@userhub.dev" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Home")).not.toBeInTheDocument();
  });

  test("links to the login page for existing users", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("link", { name: /sign in/i }));
    expect(await screen.findByText("Login Screen")).toBeInTheDocument();
  });
});

describe("ProtectedRoute guard", () => {
  const renderGuarded = (initialEntry) =>
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<div>Login Screen</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

  test("redirects an unauthenticated visitor to /login", async () => {
    getToken.mockReturnValue(null);
    renderGuarded("/");
    expect(await screen.findByText("Login Screen")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("renders the protected content once a valid token is present", async () => {
    getToken.mockReturnValue("valid-jwt");
    authService.me.mockResolvedValue({ user: { email: "admin@userhub.dev", role: "admin" } });
    renderGuarded("/");
    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
  });
});
