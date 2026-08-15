import { useEffect, useState } from "react";

/**
 * Returns true only if `active` stays true for longer than `delay` ms.
 *
 * Use this to gate skeletons/spinners: on a fast connection, `active`
 * flips back to false before `delay` elapses, so the loading UI never
 * renders at all - no flash. On a slow connection, once `delay` passes
 * this flips true, and stays true for as long as `active` does.
 *
 * @param {boolean} active - the real loading state (e.g. `loading` from
 *   context, or `stage === "skeleton"` for an individual image)
 * @param {number} delay - ms to wait before showing the loading UI
 */
export function useDelayedLoading(active, delay = 300) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!active) {
      setShowLoading(false);
      return undefined;
    }

    const timer = setTimeout(() => setShowLoading(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return showLoading;
}
