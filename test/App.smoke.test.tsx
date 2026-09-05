import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PublicPageGate } from "../src/components/PublicPageGate";
import { VideoIntro } from "../src/components/VideoIntro";
import { renderAppAt } from "./testUtils";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

describe("Public site smoke test", () => {
  it("renders the intro video without throwing when the backend is unavailable", async () => {
    const { container } = renderAppAt("/");

    await waitFor(() => {
      expect(container.querySelector("video")).toBeInTheDocument();
    }, { timeout: 20000 });
  }, 25000);

  it("shows the server unavailable warning when the backend fails", () => {
    render(
      <PublicPageGate
        introComplete={false}
        loading={false}
        maintenanceMode={false}
        serverUnavailable={true}
        error={"The server is not responding"}
        errorStatus={503}
        onIntroComplete={() => {}}
        onRetry={() => {}}
      >
        <div>Public content</div>
      </PublicPageGate>
    );

    expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
    expect(screen.getByText(/500/i)).toBeInTheDocument();
    expect(screen.queryByText("Public content")).not.toBeInTheDocument();
  });

  it("autoplays muted immediately without any user click, then unmutes only on a real gesture", async () => {
    const onComplete = vi.fn();
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(() => Promise.resolve());

    render(<VideoIntro onComplete={onComplete} />);

    const video = document.querySelector("video") as HTMLMediaElement;
    expect(video).not.toBeNull();

    // Plays immediately, muted, with no interaction required.
    await waitFor(() => {
      expect(video.muted).toBe(true);
    });
    expect(video.volume).toBe(1);

    // Chrome pauses playback if you unmute without a gesture, so only a real
    // user interaction (e.g. a click anywhere) should ever trigger unmuting.
    fireEvent.pointerDown(document.body);
    expect(video.muted).toBe(false);

    fireEvent.ended(video);

    expect(onComplete).toHaveBeenCalledTimes(1);
    playSpy.mockRestore();
  });

  it("keeps the intro visible while data is loading and never shows a blocking loading label", () => {
    render(
      <PublicPageGate
        introComplete={true}
        loading={true}
        maintenanceMode={false}
        serverUnavailable={false}
        error={null}
        errorStatus={null}
        onIntroComplete={() => {}}
        onRetry={() => {}}
      >
        <div>Public content</div>
      </PublicPageGate>
    );

    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    expect(document.querySelector("video")).toBeInTheDocument();
    expect(screen.queryByText("Public content")).not.toBeInTheDocument();
  });
});
