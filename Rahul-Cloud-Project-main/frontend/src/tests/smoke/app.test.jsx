import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../../context/ThemeContext";
import { ToastProvider } from "../../context/ToastContext";
import { AuthProvider } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import Dashboard from "../../pages/Dashboard";
import UsersPage from "../../pages/UsersPage";
import AddUser from "../../pages/AddUser";
import EditUser from "../../pages/EditUser";
import UserDetail from "../../pages/UserDetail";
import NotFound from "../../pages/NotFound";
import { userService } from "../../services/api";
window.matchMedia ??= () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
});
vi.mock("../../services/api", () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    stats: vi.fn().mockResolvedValue({
      total: 0,
      recentUsers: 0,
      growthRate: 0,
      domainBreakdown: {},
    }),
    search: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  authService: {
    login: vi.fn(),
    me: vi.fn().mockResolvedValue({
      user: {
        email: "admin@userhub.dev",
        role: "admin",
      },
    }),
  },
  getToken: vi.fn(() => "test-token"),
  setToken: vi.fn(),
}));
const renderApp = (route) =>
  render(
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="add" element={<AddUser />} />
                <Route path="edit/:id" element={<EditUser />} />
                <Route path="user/:id" element={<UserDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
describe("app smoke test", () => {
  test("boots at the root route without crashing and shows the app shell", async () => {
    renderApp("/");
    expect(await screen.findByText("UserHub")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /overview/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /people/i,
      })
    ).toBeInTheDocument();
    expect(userService.stats).toHaveBeenCalled();
  });
  test("boots at the /users route without crashing", async () => {
    renderApp("/users");
    expect(await screen.findByText("UserHub")).toBeInTheDocument();
    expect(userService.getAll).toHaveBeenCalled();
  });
  test("shows a not-found page for an unknown route", async () => {
    renderApp("/does-not-exist");
    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Overview",
        exact: true,
      })
    ).toBeInTheDocument();
  });
});
