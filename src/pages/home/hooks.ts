import { useEffect, useState, type RefObject } from "react";

/** True when the visitor asked for less motion. Read after mount, so the server render stays neutral. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const hasIO = (): boolean => typeof window !== "undefined" && "IntersectionObserver" in window;

/**
 * Becomes true the first time the element is seen, and stays true. Without IntersectionObserver,
 * or when the visitor prefers reduced motion, it turns true straight after mount.
 */
export function useSeenOnce(ref: RefObject<Element | null>, options: IntersectionObserverInit = { threshold: 0.6 }): boolean {
  const [seen, setSeen] = useState(false);
  const { threshold, rootMargin } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!hasIO() || prefersReducedMotion()) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin]);
  return seen;
}

/** The page's query string (for ?ref=), read after mount so the server and first client render match. */
export function useSearch(): string {
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), []);
  return search;
}
