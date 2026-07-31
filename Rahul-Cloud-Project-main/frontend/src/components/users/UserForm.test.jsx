import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserForm from "./UserForm";
describe("UserForm", () => {
  test("shows validation errors and does not submit when fields are invalid", async () => {
    const onSubmit = vi.fn();
    render(<UserForm onSubmit={onSubmit} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /save/i,
      })
    );
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  test("submits the form data once every field is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    render(<UserForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: {
        value: "Alice Smith",
      },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "alice@example.com",
      },
    });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: {
        value: "Acme Corp",
      },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: {
        value: "123 Main Street",
      },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /save/i,
      })
    );
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Alice Smith",
        email: "alice@example.com",
        company: "Acme Corp",
        address: "123 Main Street",
        phone: "",
      })
    );
  });
  test("surfaces the error message when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Email already in use"));
    render(<UserForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: {
        value: "Alice Smith",
      },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "alice@example.com",
      },
    });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: {
        value: "Acme Corp",
      },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: {
        value: "123 Main Street",
      },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /save/i,
      })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Email already in use");
  });
});
