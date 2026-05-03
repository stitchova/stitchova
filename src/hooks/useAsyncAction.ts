import { useCallback, useRef, useState } from "react";

/**
 * Wrap an async (or sync) handler so the UI can show a loading state
 * and we automatically ignore re-entrant taps while it's running.
 *
 * Usage:
 *   const save = useAsyncAction(async () => { await api.save() });
 *   <button disabled={save.loading} onClick={save.run}>...</button>
 */
export function useAsyncAction<TArgs extends unknown[]>(
  handler: (...args: TArgs) => unknown | Promise<unknown>,
  options: { minDuration?: number } = {}
) {
  const { minDuration = 350 } = options;
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: TArgs) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      const start = Date.now();
      try {
        await handler(...args);
      } finally {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minDuration - elapsed);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        inFlight.current = false;
        setLoading(false);
      }
    },
    [handler, minDuration]
  );

  return { run, loading };
}