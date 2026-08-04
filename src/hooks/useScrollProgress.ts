import { useEffect, useState } from "react";

/** Returns a 0-1 progress value as the page scrolls through `distancePx`. */
export function useScrollProgress(distancePx: number): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const value = distancePx > 0 ? window.scrollY / distancePx : 0;
        setProgress(Math.min(1, Math.max(0, value)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [distancePx]);

  return progress;
}
