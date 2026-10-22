// Redesign backend. api: the Supabase function URL ("" hides the tool and keeps the hand-made concept form).
// instant: true only when ANTHROPIC_API_KEY is set on the function; otherwise requests queue and are emailed within the hour.
window.BRINGSUP = {
  api: "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign",
  instant: false
};
