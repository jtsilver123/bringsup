/**
 * The redesign backend (Supabase Edge Function). Requests queue and an hourly Claude Code task
 * on the Claude subscription designs them; see tools/QUEUE_WORKER.md. Set to "" to hide the tool
 * and fall back to the hand-made concept form.
 */
export const REDESIGN_API = "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign";

/** The projects backend; its public `?status=<ref>` tells the /changes and /extra pages how many rounds are left. */
export const PROJECTS_API = "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/projects";

export const TALLY = {
  concept: "bZ5vj0",
  start: "Ar7yBl",
  changes: "EqkMlA",
  approve: "VpLDP6",
  extra: "5XBMpd",
} as const;
