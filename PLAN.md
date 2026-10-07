# Personalized Asset Generator — implementation plan

## Goal

Turn a short Clay prompt containing the seller brief, universe logic, scoring signal, signal reasoning, selected buyer, and relevant URLs into a useful, source-conscious personalized asset with a hosted URL.

## Architectural decision

Use a synchronous Next.js/Vercel API rather than importing a prebuilt Clay workflow. Clay builds the request live; this service normalizes it, generates an asset, validates it, stores it, renders it, and returns the URL.

## Reused bones from the GTM playbook

1. A staged generation pipeline rather than one uncontrolled prompt.
2. Strong prospect-specific hero and branding.
3. Evidence first, followed by interpretation.
4. A non-obvious but supportable insight.
5. A useful main module rather than generic prose.
6. “What this means” and concrete next actions.
7. Source retention, quality gates, hosted delivery, and a clean handoff.

## Replaced assumptions

- The output is not always a GTM playbook.
- The page can become an audit, report, map, comparison, or action plan.
- The selected buyer and Task 1–3 reasoning are first-class inputs.
- An optional gift module is separate from the core asset and fails open by omission.

## Delivery phases

### Phase 1 — bones (this repository version)

- Prompt-only and structured request support.
- Stable schemas and normalization.
- Deterministic fallback generator.
- Flexible block renderer.
- Hosted asset route and retrieval API.
- Vercel Blob adapter with local in-memory fallback.
- Customer-support example and tests.

### Phase 2 — meat

- Plug an approved agent service into `ASSET_GENERATOR_URL`.
- Use bounded roles: strategist, evidence critic, optional gift researcher, final writer.
- Preserve the same request and response contracts.
- Add source retrieval and claim-level citations.
- Add brand extraction only when it fits the latency budget.

### Phase 3 — gift fulfillment

- Only after explicit organizer and spend approval.
- Add allowlisted gift categories, policy checks, a fixed value cap, and idempotent issuance.
- Never infer or use sensitive personal traits.

## Performance budget

| Stage | Target |
| --- | ---: |
| Request normalization and validation | 2 seconds |
| Parallel planning, evidence review, optional public gift cue | 35–50 seconds |
| Final asset writing | 20–35 seconds |
| QA and schema repair | 10–15 seconds |
| Storage and page publication | 3–8 seconds |
| Total target | 80–110 seconds |

The deterministic fallback should return in seconds when the agent service is unavailable.
