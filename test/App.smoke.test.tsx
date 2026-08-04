import { describe, it, expect } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderAppAt } from "./testUtils";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

describe("Public site smoke test", () => {
  it("renders without throwing and eventually shows hero content", async () => {
    const { container } = renderAppAt("/");
    // Loader is shown first (role=status); eventually the hero content appears.
    await waitFor(
      () => {
        expect(container.textContent).toContain("Phoenix Media");
      },
      { timeout: 20000 },
    );
  }, 25000);
});
