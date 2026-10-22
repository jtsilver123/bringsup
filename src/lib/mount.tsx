import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

/** Hydrate the pre-rendered page, or render from scratch in dev (where the root is empty). */
export function mount(page: ReactNode): void {
  const root = document.getElementById("root")!;
  const app = <StrictMode>{page}</StrictMode>;
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
