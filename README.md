# EnrichFlow Personalized Assets

A prompt-first, evidence-conscious generator for Clay Cup Task 4. It accepts either one free-form prompt or structured fields, creates the most appropriate asset shape, publishes a polished page, and returns a URL.

The generator is intentionally not tied to one use case. The same contract can produce:

- a readiness audit;
- a market, account, stakeholder, or opportunity map;
- a hiring, capacity, or operational report;
- a comparison;
- an action plan.

## Why this is separate from the GTM playbook

The GTM playbook is a deep seller-oriented research product. This repository keeps its strongest architecture—evidence, insight, useful modules, narrative progression, branding, quality gates, and hosted delivery—but removes the assumption that every recipient needs an outbound strategy.

## Request modes

### Simplest Clay request

```json
{
  "prompt": "Product: SupportLoop helps software companies coordinate customer-support QA, escalation, knowledge and workforce operations. Universe: US B2B software companies with 500-2,000 employees and at least one active support opening. Signal: active sales openings plus active customer-support openings. Signal logic: sales hiring may create future customer and support complexity. Buyer: Jane Smith, VP Customer Support. Company: Acme. Domain: acme.com. Person LinkedIn: https://linkedin.com/in/example. Create a useful personalized asset without asserting that the support operation is broken."
}
```

The endpoint also accepts the same content as `text/plain`.

### Optional structured request

```json
{
  "productDescription": "SupportLoop coordinates support QA, escalation and knowledge workflows.",
  "universe": "US B2B software companies with 500-2,000 employees and active support hiring.",
  "signal": "Eight sales openings and four support openings.",
  "signalLogic": "Increasing sales capacity may create additional support complexity.",
  "icp": "VP Customer Support or Support Operations",
  "companyName": "Acme",
  "companyDomain": "acme.com",
  "recipientName": "Jane Smith",
  "recipientTitle": "VP Customer Support",
  "personLinkedInUrl": "https://linkedin.com/in/example"
}
```

## API

```bash
curl -X POST http://localhost:3000/api/assets \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer local-secret' \
  -H 'Idempotency-Key: acme-jane-finals' \
  -d '{"prompt":"Product: ..."}'
```

Response:

```json
{
  "success": true,
  "slug": "acme-support-readiness-a7k2",
  "assetType": "report",
  "assetTitle": "Acme Customer Support Growth Readiness Brief",
  "assetUrl": "https://example.vercel.app/a/acme-support-readiness-a7k2",
  "generationMode": "fallback",
  "warnings": [],
  "executionTimeMs": 18
}
```

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`, or call the API directly.

Without `BLOB_READ_WRITE_TOKEN`, local development uses an in-memory store. Configure Vercel Blob before production deployment so assets persist across serverless invocations.

## Generation modes

- `fallback`: deterministic generator included in this repository. It never invents numeric evidence and returns quickly.
- `agent`: optional approved service configured through `ASSET_GENERATOR_URL`. It must return an asset matching the public schema.

The renderer and API contract do not change when the agent “meat” is added.

## Clay setup

See [docs/CLAY_SETUP.md](docs/CLAY_SETUP.md) for the blank-workspace build sequence and prompt.

## Safety boundaries

- LinkedIn URLs are research seeds, not evidence by themselves.
- Public hobby cues require a clear source and high confidence.
- Sensitive personal traits are never allowed.
- Actual gift purchasing is intentionally not implemented in this version.
