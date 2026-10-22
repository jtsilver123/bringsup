// Shared by tools/projects-worker.ts and tools/queue-worker.ts: calls to a BringsUp edge function as the worker.
// Not a command itself.

/** The function's WORKER_TOKEN secret, sent as x-worker-token. */
export const WORKER_TOKEN = process.env.BRINGSUP_WORKER_TOKEN || "";

/** Stop with a message unless BRINGSUP_WORKER_TOKEN is set. */
export function requireWorkerToken(): void {
  if (!WORKER_TOKEN) {
    console.error("Set BRINGSUP_WORKER_TOKEN first.");
    process.exit(1);
  }
}

/** A caller for one function URL. Resolves to the JSON answer; any non-2xx status throws "<status>: <error>". */
export function functionApi(base: string) {
  return async (method: "GET" | "POST", query: string, body?: unknown): Promise<any> => {
    const res = await fetch(base + query, {
      method,
      headers: { "x-worker-token": WORKER_TOKEN, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${res.status}: ${data.error || "request failed"}`);
    return data;
  };
}
