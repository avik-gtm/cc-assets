# Personalized assets — recipient-first prototype

The current milestone is one complete, source-backed customer-support asset, not a universal autonomous generator.

## Open it

Run `npm install`, then `npm run dev`.

- `/examples/linear-support`: the authored recipient-facing reference.
- `/a/linear-support-onboarding`: the same reference through the asset URL contract.
- `/`: operator workspace, clearly separate from the prospect page.
- `/api/assets/linear-support-onboarding/download`: editable Markdown kit.

The reference contains three product-specific support reply drafts, a proposed escalation matrix, a five-day practice checklist, and an internal handoff template. It uses Linear's public documentation and official logo assets. It makes no claim about Linear hiring, ticket volume, internal processes, or performance. SupportLoop is the fictional seller from the exercise. There is no affiliation or endorsement.

## Correct reference and reuse

The design/editorial reference is **avik-gtm/enrichflow-gtm-audit**, the newer Outbound Growth Playbook confirmed by the user. The original repo is untouched.

Reused principles: company identity and palette, outcome-led editorial cover, useful work first, expandable supporting detail, source receipts. Not copied: the fixed GTM content, account scoring, outbound campaigns for every prospect, or EnrichFlow's CTA.

The renderer is data-driven. It supports replies, checklists, true tables, cards, steps, and narrative sections. Reusing the shell does not mean reusing Linear's facts or the support asset for unrelated sellers.

## What is working

- Fully authored reference with real source links and checked dates.
- Source-backed response drafts; proposals distinguished from documented behavior.
- Prospect branding, collapsible sections, copy buttons, interactive checklists, editable download.
- Recipient-only projection for page, public JSON, and download. Internal Task 5 hook and research seeds do not ship to the recipient.
- Explicit reference API mode and an approved-generator adapter with typed schema validation.
- HTTPS-only external links, safe text rendering, hosted POST authentication fails closed.
- Bundled reference survives server restarts without a database.

## What is NOT complete

No live research/writer service is configured. A new prompt without `ASSET_GENERATOR_URL` returns **503**, not a generic placeholder advertised as personalized work. The older fallback module is retained only for historical compatibility tests and is not called by the publication path.

Arbitrary-company generation still requires a real service implementing bounded research, branding, writing, and evidence checks. New generated assets on Vercel also need durable storage and `ASSET_API_KEY`. The provider adapter has contract tests, not a live-model test. The <120 second goal is unproven for researched generation; millisecond reference retrieval is not a generation benchmark.

Gift fulfillment is not implemented. No gifts are purchased and no hobbies are inferred. Suggested gifts do not appear as redeemable gifts on public pages.

## Verify

`npm run typecheck`, `npm test`, and `npm run build`.

Tests cover content completeness, schema validity, private-field removal, source links, markdown export, safe URLs, table dimensions, explicit reference mode, model failure handling, durable-storage gating, and API authentication/status boundaries.

See [Clay setup](docs/CLAY_SETUP.md), [implementation plan](PLAN.md), and [reference/source notes](docs/REFERENCE.md).
