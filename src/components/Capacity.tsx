import { useEffect, useState } from "react";
import { PROJECTS_API } from "../lib/config.ts";
import "./capacity.css";

interface Cap { month: string; next_month: string; cap: number; taken: number; left: number }

/** This month's real count of new sites against our monthly cap (projects ?capacity=1). Shows nothing until it loads or if it fails. */
export function Capacity({ className = "" }: { className?: string }) {
  const [c, setC] = useState<Cap | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${PROJECTS_API}?capacity=1`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.cap === "number" && d.cap > 0) setC(d); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  if (!c) return null;
  const full = c.left === 0;
  const pct = Math.min(100, Math.round((c.taken / c.cap) * 100));
  return (
    <div className={`capacity ${full ? "full" : ""} ${className}`.trim()}>
      <p className="cap-line">
        {full
          ? <><b>{c.month} is full.</b> Start now and yours is first in line for {c.next_month}.</>
          : <><b>{c.left} of {c.cap} spots left in {c.month}.</b> I take on {c.cap} new sites a month so each one gets real attention.</>}
      </p>
      <div className="cap-bar" role="meter" aria-valuemin={0} aria-valuemax={c.cap} aria-valuenow={c.taken} aria-label={`${c.taken} of ${c.cap} spots taken in ${c.month}`}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
