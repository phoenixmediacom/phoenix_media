import { useEffect, useRef } from "react";

/**
 * Calls `onTimeout` once if `active` remains true for longer than
 * `timeoutMs`. Used by the cinematic engine to guarantee the loader can
 * never block the application forever, but it has no knowledge of the
 * engine itself — it's a generic safety hook for any async gate.
 *
 * @param active     Whether the timeout should currently be counting down.
 * @param timeoutMs  Maximum duration, in milliseconds, before `onTimeout` fires.
 * @param onTimeout  Called at most once per `active` transition to `true`.
 */
export function useLoadingTimeout(
  active: boolean,
  timeoutMs: number,
  onTimeout: () => void,
): void {
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!active) return;

    const timerId = window.setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);

    return () => window.clearTimeout(timerId);
  }, [active, timeoutMs]);
}
