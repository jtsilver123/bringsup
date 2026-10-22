import { useEffect, useState } from "react";

/** True when the visitor asked for less motion. Read after mount, so the server render stays neutral. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const hasIO = (): boolean => typeof window !== "undefined" && "IntersectionObserver" in window;

/** The page's query string (for ?ref=), read after mount so the server and first client render match. */
export function useSearch(): string {
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), []);
  return search;
}
