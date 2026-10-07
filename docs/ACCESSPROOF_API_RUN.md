# AccessProof API attempt — 2026-10-07

## Request sent

`POST https://enrichflow-personalized-assets.vercel.app/api/assets`

- Body: [`../examples/requests/accessproof-northstar.json`](../examples/requests/accessproof-northstar.json), unchanged across both attempts.
- `Content-Type: application/json`
- `Idempotency-Key: accessproof-northstar-practice-2026-10-07`
- Second attempt: `Authorization: Bearer [secret]`. The secret is stored as a sensitive production environment variable, not in this repository.

The body contains one `prompt` string. It describes AccessProof, a fictional retailer named Northstar Commerce, the universe, a hypothetical redesign signal, the signal hypothesis, the Head of Digital Product buyer, and a requested testing/remediation starter kit. It explicitly says no actual site or defects were verified. It provides no domain, LinkedIn profile, logo, source content, source URLs, or gift.

The direct writer receives: server-side recipient-first instructions + the supplied-context-only restriction + the normalized input + the structured output schema. No final asset text is pre-written in the request.

## Outcomes

1. Original deployed endpoint: HTTP 401, `Unauthorized.`, 1,395 ms. No production environment variables were configured.
2. After adding the writer, authentication, and storage: HTTP 503, 1,190 ms. No asset URL or slug was returned.
3. A narrow model diagnostic returned `GatewayInternalServerError`, HTTP 403: the Vercel team requires a valid payment method to service Gateway requests. No billing method was added, no credits were purchased, and no model output was returned.

These timings measure failed requests, NOT successful asset generation.

## Implementation and deployment

- Direct writer: AI SDK 7.0.130, model `anthropic/claude-sonnet-5.5` selected from the live Gateway catalog for structured document writing.
- 90-second model deadline, 6,500-token output limit, no SDK retries.
- Dedicated public Blob store: `personalized-assets`, `store_bOLKrfOldCzhK0bc`; only recipient-projected records may be written.
- Deployment: `dpl_8ep9tBDgtMGHJe3oG1FB1MxCW9Ja`, production, READY, approximately 36 seconds.
- URL: https://enrichflow-personalized-assets.vercel.app
- 25 tests, typecheck, and production build passed.
- Production dependency audit: zero reported vulnerabilities. Full development dependency audit still reports three existing Vitest-related vulnerabilities; no unrelated major test-framework upgrade was performed.
- Runtime error scan found the expected failed POST. Persistent monitoring/drains were not verified.

## Required next action

The user must enable Gateway access for this Vercel team or select another authorized generator/provider. Then configure a usable caller credential securely and rerun the saved request. Confirm the public page and download after actual successful generation. Do not substitute a static example and describe it as generated.
