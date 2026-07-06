import { useEffect, useState } from "react";

/**
 * True when the user asked the OS to minimize motion. SSR-safe (defaults false,
 * resolves on mount). Use it to skip decorative animation in JS; CSS transitions
 * are already neutralized by the prefers-reduced-motion block in styles.css.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
