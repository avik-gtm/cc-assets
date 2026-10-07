# Clay contract and current limits

## Test the authored reference

POST `/api/assets` with `Content-Type: application/json` and:

```json
{ "example": "linear-support" }
```

This explicitly returns the saved reference. It does not interpret a company prompt or perform new research. The response says `generationMode: reference` and `storage: bundled` and includes a hosted `assetUrl`.

## Plain-language input for live generation

The API accepts `{"prompt":"..."}` or a plain-text body. Structured company fields are optional. You do not need to manually construct the full asset schema.

Five practical inputs in one prompt (you do not need to construct the output schema):

```text
Product: [Seller, what it does, and the problem it helps solve]
Prospect: [Recipient company and domain if known]
Buyer: [Selected person's role; name optional]
Observed facts: [Signal, data, source text, and source URLs; identify unknowns]
My reasoning: [Why this matters to the buyer; distinguish hypothesis from fact]
Create a personalized brief: headline, current situation, likely problem, solution, alternative options, CTA.
Include our product as one honest alternative; offer a walkthrough of something specific.
No email subject, greeting, or sign-off. Do not invent similar-company evidence or gift approval.
Keep my scoring, qualification notes, and outreach draft private.
```

Task 1 universe filters, scores, scoring logic, company/person LinkedIn URLs, a preferred asset type, or approved logo URL/colors are optional additions. The generator uses those to select the work, not to publish your qualification logic. A successful response supplies `assetUrl` for Task 4 and a separate `task5Hook` for Task 5. See [the practical JSON guide](CLAY_REQUEST_GUIDE.md), including optional gift offers and CTA links.

POST to `https://enrichflow-personalized-assets.vercel.app/api/assets` with `Content-Type: application/json` and `Authorization: Bearer [your private API key]`. Body: `{"prompt":"the context above"}`. Let your HTTP client serialize it—do not manually concatenate unescaped JSON. `/` offers a payload builder that copies valid JSON; it does not call the API or expose credentials.

**Current limitation:** the separate content generator is not connected yet. AI Gateway has been removed; no Vercel model billing or payment setup is needed. New-company requests return an explicit 503 until the connection is verified. The authored reference remains readable.

The writer contract uses only supplied context. It does not retrieve source URLs or inspect websites. Missing evidence must yield a proposed plan, not fabricated findings. See `examples/requests/accessproof-northstar.json` for a prompt-only request example; its historical failed run is not evidence of a generated result.

## Service contract

The separate service receives `systemPrompt`, `input`, and the `GeneratedAsset` JSON schema. It must return a valid JSON object directly. The adapter allows 90 seconds, requires HTTPS and private authentication for hosted requests, forbids redirects, bounds output to 1 MB, and rejects invalid output or unsupplied source URLs. It does not automatically supply web-research or model credentials.

Required for hosted new-company generation:

- `ASSET_GENERATOR_URL` and `ASSET_GENERATOR_TOKEN` for the separate writer. These are server-only settings, not fields to put in each Clay row.
- `ASSET_API_KEY` for authenticated Clay POSTs: `Authorization: Bearer [key]`.
- `BLOB_READ_WRITE_TOKEN` or the supported linked Blob configuration for durable generated assets.
- `NEXT_PUBLIC_APP_URL` set to the actual deployed origin if an override is needed; never set it to localhost in production.

On Vercel, POST is denied when `ASSET_API_KEY` is absent. The public operator form intentionally does not store the key. Use Clay's credential mechanism for production requests. Public asset pages and downloads contain recipient content only; the POST response includes `task5Hook` for the operator.

The API key is a sensitive Vercel secret and cannot be recovered via `env pull` (the local value is blank). Use the existing key from its approved secure location; if unavailable, coordinate a replacement with the owner and update Clay at the same time. Do not rotate a potentially used key silently, paste keys into chat, or commit them.

The public reference needs none of these secrets or storage services. Its data is bundled with the app.

## Competition constraints

Get the organizer's approval for the idea and runtime, then recreate the approved setup during the monitored window. Do not treat an existing deployment or this setup document as permission to use it on stage. No gift purchases are enabled.
