# Working on BringsUp

Read `tools/WORKFLOW.md` first: it maps the whole business and the systems behind it.

Rules for any session that changes this repo or the business:
- **Document as you go.** A change to how the business runs updates `tools/WORKFLOW.md` and the doc that owns that step in the same commit (see "Keeping it in sync" there).
- **Keep the hourly task in sync.** If a change affects what the "BringsUp operator" scheduled task should do, update its prompt too, and merge to main so its next run reads the new docs.
- **Accuracy first.** Never invent facts about a business (hours, prices, awards, policies, directions, reviews). Use the sources listed in WORKFLOW.md "Accuracy", and flag anything that may be stale.
- **Voice.** Plain, specific, no hype, no em dashes or exclamation marks in anything customers read (brand.md, tools/email_template.md "Never write any of these").
- **Design.** Sites we make must look crafted and specific to the business, never templated (no rating pills, stat strips, identical card grids or fade-in animations).
- Don't touch anything BetterCampus. Email only from jake@bringsup.com. Never put secrets in this public repo.
- Before merging: `npx tsc --noEmit -p .`, `npm run build`, and `node tools/simulate-flow.ts` if the backend changed.
