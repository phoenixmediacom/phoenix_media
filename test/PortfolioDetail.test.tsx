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

describe("Portfolio event detail page", () => {
  it("renders a seeded event's title and Behind The Scenes badge", async () => {
    const { container } = renderAppAt("/portfolio/4events-corporate-launch");

    await waitFor(
      () => {
        expect(container.textContent).toContain("4Events Corporate Launch");
      },
      { timeout: 10000 },
    );

    expect(container.textContent).toContain("Behind The Scenes");
  }, 15000);

  it("renders a people-section event with featured personalities", async () => {
    const { container } = renderAppAt("/portfolio/aseer-summer-season");

    await waitFor(
      () => {
        expect(container.textContent).toContain("Mohammed Abdo");
      },
      { timeout: 10000 },
    );
  }, 15000);
});
