# Repository operating rules

- Preserve the prompt-first API: callers must be able to send one `prompt` string without constructing the full asset schema.
- Keep facts, inferences, and unknowns distinct in every generated asset.
- Never invent metrics, customers, outcomes, quotes, hobbies, or source URLs.
- Treat LinkedIn URLs as research seeds, not verified evidence.
- The public page must render safely without raw model-generated HTML.
- The renderer must keep working when the optional agent service is unavailable.
- Do not add actual gift purchasing until organizer approval, a fixed budget, idempotency, and policy checks exist.
- No secrets in source control. All external services use environment variables.
- Vercel hosts pages, the forwarding API, and finished documents only. Generation runs separately; do not add Vercel AI Gateway or require Vercel model billing.
- Target a synchronous response under 120 seconds. Keep the authored reference available without a model service; never publish generic fallback copy as a finished personalized asset.
- Use enrichflow-gtm-audit as the visual/editorial reference, not the older enrichflow-gtm-playbook repository.
- Separate operator-only context from public assets. Task 5 hooks, lead scores, qualification logic, warnings, and research seeds must not leak into public pages, downloads, or JSON.
- New assets follow the user's six-part format: headline, current situation, likely problem, solution, alternative options including the seller, and public CTA. Task 5 is still separate. No invented case histories, competitor weaknesses, or gift approval; gift offers come only from explicit caller approval.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
