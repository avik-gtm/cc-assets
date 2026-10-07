# Clay contract and current limits

## Test the authored reference

POST `/api/assets` with `Content-Type: application/json` and:

```json
{ "example": "linear-support" }
```

This explicitly returns the saved reference. It does not interpret a company prompt or perform new research. The response says `generationMode: reference` and `storage: bundled` and includes a hosted `assetUrl`.

## Plain-language input for live generation

The API accepts `{"prompt":"..."}` or a plain-text body. Structured company fields are optional. You do not need to manually construct the full asset schema.

Suggested context:

```text
Product: [Seller and what the product helps its customers do]
Company: [Recipient company]
Domain: [Recipient domain]
Buyer: [Selected person's role]
Universe: [Why this company entered the list]
Signal: [What you actually observed]
Signal logic: [Your hypothesis, clearly separate from facts]
Verified evidence: [Specific observations and source text]
Source URLs: [Relevant pages]
Create one useful asset for this recipient. Complete part of their work.
Keep my scoring, qualification notes, and outreach draft private.
```

**Current limitation:** the direct AI Gateway writer is implemented and configured, but the Vercel team requires billing verification before model calls are allowed. The AccessProof run returned 503; no generated asset was published. The reference remains readable.

The direct writer accepts the same prompt and uses only supplied context. It does not retrieve source URLs or inspect websites. Missing evidence must yield a proposed plan, not fabricated findings. See `examples/requests/accessproof-northstar.json` for the exact prompt-only request attempted.

## Service contract

The approved service receives `systemPrompt`, `input`, and the `GeneratedAsset` JSON schema. It must return a valid JSON object directly. The adapter allows 90 seconds for this call and rejects invalid output. It does not automatically supply web-research or model credentials.

Required for hosted new-company generation:

- `AI_GATEWAY_MODEL` plus authorized Gateway access via deployment OIDC, OR `ASSET_GENERATOR_URL` with optional `ASSET_GENERATOR_TOKEN`.
- `ASSET_API_KEY` for authenticated Clay POSTs: `Authorization: Bearer [key]`.
- `BLOB_READ_WRITE_TOKEN` or the supported linked Blob configuration for durable generated assets.
- `NEXT_PUBLIC_APP_URL` set to the actual deployed origin if an override is needed; never set it to localhost in production.

On Vercel, POST is denied when `ASSET_API_KEY` is absent. The public operator form intentionally does not store the key. Use Clay's credential mechanism for production requests. Public asset pages and downloads contain recipient content only; the POST response includes `task5Hook` for the operator.

The API key is a sensitive Vercel secret and cannot be recovered via `env pull` (the local value is blank). Before connecting Clay, set a new API key through your secure configuration flow and put the same value into Clay's bearer credential. Do not paste keys into chat or committed JSON files.

The public reference needs none of these secrets or storage services. Its data is bundled with the app.

## Competition constraints

Get the organizer's approval for the idea and runtime, then recreate the approved setup during the monitored window. Do not treat an existing deployment or this setup document as permission to use it on stage. No gift purchases are enabled.
