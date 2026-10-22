/**
 * The redesign backend (Supabase Edge Function). Requests queue and an hourly Claude Code task
 * on the Claude subscription designs them; see tools/QUEUE_WORKER.md. Set to "" to hide the tool
 * and fall back to the hand-made concept form.
 */
export const REDESIGN_API = "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign";

/** The projects backend; its public `?status=<ref>` tells the /changes and /extra pages how many rounds are left. */
export const PROJECTS_API = "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/projects";

/** Stripe Payment Links (InstateMe Stripe account). The approve and extra pages send the owner here after their form. */
export const STRIPE_LINKS = {
  approve: "https://buy.stripe.com/8x2dR80ECbrl4Qz9yk3cc08",
  extra: "https://buy.stripe.com/9B69ASevs1QL3Mv39W3cc09",
  /** The $49/month managed plan (a subscription); Stripe sends them back to /managed/?paid=1. */
  managed: "https://buy.stripe.com/8x228qafcanh4QzaCo3cc0a",
} as const;

/** Stripe's hosted login page where managed-plan customers update their card or cancel. */
export const STRIPE_PORTAL = "https://billing.stripe.com/p/login/7sY9AS3QO8f9fvd5i43cc00";

export const TALLY = {
  concept: "bZ5vj0",
  start: "Ar7yBl",
  changes: "EqkMlA",
  approve: "VpLDP6",
  extra: "5XBMpd",
} as const;
