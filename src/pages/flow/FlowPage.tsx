export function FlowPage({ kind }: { kind: "start" | "changes" | "approve" }) {
  return <main>{kind}</main>;
}
