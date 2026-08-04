import { describe, it, expect, beforeEach } from "vitest";
import { waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAppAt } from "./testUtils";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

describe("Admin auth flow", () => {
  beforeEach(() => {
    window.localStorage.removeItem("phoenix-media:auth:token");
    window.localStorage.removeItem("phoenix-media:auth:refresh");
  });

  it("redirects an unauthenticated visitor from /admin to /admin/login", async () => {
    renderAppAt("/admin");
    await waitFor(() => {
      expect(screen.getByText(/admin sign in/i)).toBeInTheDocument();
    });
  });

  it("logs in with the seeded demo credentials and reaches the dashboard", async () => {
    renderAppAt("/admin/login");
    const user = userEvent.setup();

    const emailInput = await screen.findByLabelText(/email/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    await user.type(emailInput, "admin@phoenixmedia.com");
    await user.type(passwordInput, "phoenix2026");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /overview/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  }, 10000);

  it("rejects incorrect credentials with a visible error", async () => {
    renderAppAt("/admin/login");
    const user = userEvent.setup();

    const emailInput = await screen.findByLabelText(/email/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
