import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's OS-level reduced-motion preference live, including
 * changes made while the app is open (e.g. toggled in system settings).
 *
 * This hook is intentionally generic — it has no knowledge of the cinematic
 * engine and can be reused by any animated feature in the app.
 */
export function usePrefersReducedMotion(): boolean {
  const supportsMatchMedia =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function";

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => (supportsMatchMedia ? window.matchMedia(QUERY).matches : false),
  );

  useEffect(() => {
    if (!supportsMatchMedia) return;

    const mediaQueryList = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return prefersReducedMotion;
}
