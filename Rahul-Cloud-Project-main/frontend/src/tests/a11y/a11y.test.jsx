import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import { MemoryRouter } from "react-router-dom";
import UserForm from "../../components/users/UserForm";
import { ConfirmModal } from "../../components/ui/Modal";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import { AuthProvider } from "../../context/AuthContext";
import { ToastProvider } from "../../context/ToastContext";

expect.extend(matchers);

vi.mock("../../services/api", () => ({
  authService: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
}));

// "region"/landmark rules audit the whole page; they aren't meaningful when
// auditing an isolated component fragment, so we disable them here.
const FRAGMENT_OPTS = {
  rules: { region: { enabled: false }, "landmark-one-main": { enabled: false } },
};

describe("accessibility (axe-core)", () => {
  test("UserForm has no detectable a11y violations", async () => {
    const { container } = render(<UserForm onSubmit={() => {}} />);
    expect(await axe(container, FRAGMENT_OPTS)).toHaveNoViolations();
  });

  test("ConfirmModal (dialog) has no detectable a11y violations", async () => {
    const { container } = render(
      <ConfirmModal title="Remove person" message="Are you sure?" onConfirm={() => {}} onClose={() => {}} />
    );
    expect(await axe(container, FRAGMENT_OPTS)).toHaveNoViolations();
  });

  test("Login page has no detectable a11y violations", async () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test("Register page has no detectable a11y violations", async () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
