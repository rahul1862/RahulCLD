import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../../context/ToastContext";
import UsersPage from "../../pages/UsersPage";
import { userService } from "../../services/api";
vi.mock("../../services/api", () => ({
  userService: {
    getAll: vi.fn(),
    remove: vi.fn(),
  },
}));
const USERS = [
  {
    _id: "1",
    name: "Alice Smith",
    email: "alice@example.com",
    address: "1 Main St",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Bob Jones",
    email: "bob@example.com",
    address: "2 Side St",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];
const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <UsersPage />
      </ToastProvider>
    </MemoryRouter>
  );
describe("UsersPage (manage people feature)", () => {
  beforeEach(() => {
    userService.getAll.mockReset().mockResolvedValue(USERS);
    userService.remove.mockReset().mockResolvedValue({
      message: "Deleted",
    });
  });
  test("lists every person returned by the API", async () => {
    renderPage();
    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });
  test("search narrows the list down to matching people", async () => {
    renderPage();
    await screen.findByText("Alice Smith");
    fireEvent.change(screen.getByLabelText(/search people/i), {
      target: {
        value: "bob",
      },
    });
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });
  test("sorting by name toggles list order", async () => {
    renderPage();
    await screen.findByText("Alice Smith");
    const rowNames = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.textContent);
    const initialOrder = rowNames();
    fireEvent.click(
      screen.getByRole("button", {
        name: /sort by name/i,
      })
    );
    await waitFor(() => expect(rowNames()).not.toEqual(initialOrder));
  });
  test("removing a person confirms, calls the API, and refreshes the list", async () => {
    renderPage();
    await screen.findByText("Alice Smith");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove Alice Smith",
      })
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    userService.getAll.mockResolvedValue([USERS[1]]);
    fireEvent.click(
      screen.getByRole("button", {
        name: /delete/i,
      })
    );
    await waitFor(() => expect(userService.remove).toHaveBeenCalledWith("1"));
    await waitFor(() => expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument());
  });
});
