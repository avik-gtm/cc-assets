# Personalized assets — recipient-first prototype

The repository contains an authored support example and a prompt-first AI writer with durable publication. The deployed writer is currently blocked by Vercel AI Gateway billing verification; it has not yet completed a live generated asset.

## Open it

Run `npm install`, then `npm run dev`.

- `/examples/linear-support`: the authored recipient-facing reference.
- `/a/linear-support-onboarding`: the same reference through the asset URL contract.
- `/`: operator workspace, clearly separate from the prospect page.
- `/api/assets/linear-support-onboarding/download`: editable Markdown kit.

The reference is a standalone support operations field guide: three diagnostic playcards, a proposed escalation matrix, a five-day onboarding checklist, and an internal handoff template. It uses Linear's public documentation and official logo assets. It makes no claim about Linear hiring, ticket volume, internal processes, or performance. SupportLoop is the fictional seller from the exercise. There is no affiliation or endorsement.

## Correct reference and reuse

The design/editorial reference is **avik-gtm/enrichflow-gtm-audit**, the newer Outbound Growth Playbook confirmed by the user. The original repo is untouched.

Reused principles: company identity and palette, useful work first, and source receipts. The shared layout is now a working document with contents, scope, open sections, and implementation notes—not the GTM reference's landing-page cover or an email. No greeting, subject, pitch, or sales CTA is part of the asset.

The renderer is data-driven. It supports checklists, true tables, cards, steps, and copyable working templates. Legacy `replies` data remains readable without email-composer styling. New generation instructions prohibit that layout and keep seller-to-prospect copy only in the private `task5Hook`. Reusing the shell does not mean reusing Linear's facts or the support asset for unrelated sellers.

## What to pass

Send one JSON field: `{"prompt":"your plain-language context"}`. In that prompt include: seller/product; prospect name/domain; selected buyer; observed facts with relevant source text; and your reasoning, clearly labelled as a hypothesis. Task 1 filters, scores, profile findings, approved brand assets, and a preferred document type are optional. The operator page builds this exact JSON body without attempting an unauthenticated POST.

The current writer does not fetch domains, LinkedIn profiles, or source URLs. Pass actual findings from Clay if you want evidence-specific material. A source link alone is not proof. See [Clay setup](docs/CLAY_SETUP.md) for a copyable prompt.

## What is working

- Fully authored reference with real source links and checked dates.
- Source-backed diagnostic playcards; proposals distinguished from documented behavior.
- Prospect branding, document contents, open working sections, copy buttons, interactive checklists, editable download.
- Recipient-only projection for page, public JSON, and download. Internal Task 5 hook and research seeds do not ship to the recipient.
- Explicit reference API mode and an approved-generator adapter with typed schema validation.
- HTTPS-only external links, safe text rendering, hosted POST authentication fails closed.
- Bundled reference survives server restarts without a database.

## What is NOT complete

Direct writing is implemented using AI SDK structured output, the configured `AI_GATEWAY_MODEL`, and deployment OIDC. The model receives your normalized prompt, server-side recipient-first instructions, and the output schema. This path has no web, LinkedIn, screenshot, or audit tools. It can write from supplied context and produce clearly labelled proposed plans; it cannot verify company facts. Unsupplied source/logo URLs are rejected. `ASSET_GENERATOR_URL` remains an alternative external-service adapter.

Production authentication and a dedicated public Blob store are configured. The AccessProof request reached the writer but failed: Vercel AI Gateway returned HTTP 403 requiring a valid payment method, and the asset API returned HTTP 503. No AccessProof asset was created. Do not claim live generation or the <120 second target is verified. See [the exact request](examples/requests/accessproof-northstar.json) and [run record](docs/ACCESSPROOF_API_RUN.md).

Arbitrary-company research, verified brand extraction, and browser accessibility testing are not implemented. The older fallback module remains for historical tests only and is never substituted for failed generation. Authenticated prompts and Task 5 handoffs must remain private; only recipient content is saved in public Blob storage.

Gift fulfillment is not implemented. No gifts are purchased and no hobbies are inferred. Suggested gifts do not appear as redeemable gifts on public pages.

## Verify

`npm run typecheck`, `npm test`, and `npm run build`.

Tests cover content completeness, schema validity, private-field removal, source links, markdown export, safe URLs, table dimensions, explicit reference mode, model failure handling, durable-storage gating, and API authentication/status boundaries.

See [Clay setup](docs/CLAY_SETUP.md), [implementation plan](PLAN.md), and [reference/source notes](docs/REFERENCE.md).
