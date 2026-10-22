import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { Home } from "../pages/home/Home.tsx";
import { Try } from "../pages/try/Try.tsx";
import { FlowPage } from "../pages/flow/FlowPage.tsx";
import { Legal } from "../pages/legal/Legal.tsx";
import { Brand } from "../pages/brand/Brand.tsx";
import { NotFound } from "../pages/notfound/NotFound.tsx";

const pages: Record<string, () => ReactNode> = {
  home: () => <Home />,
  try: () => <Try />,
  start: () => <FlowPage kind="start" />,
  changes: () => <FlowPage kind="changes" />,
  approve: () => <FlowPage kind="approve" />,
  terms: () => <Legal kind="terms" />,
  privacy: () => <Legal kind="privacy" />,
  brand: () => <Brand />,
  notFound: () => <NotFound />,
};

export function render(page: string): string {
  const make = pages[page];
  if (!make) throw new Error(`No page called ${page}`);
  return renderToString(make());
}
