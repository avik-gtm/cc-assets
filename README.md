# Personalized assets

Branded decision briefs written directly for each prospect—not internal account reports and not outbound emails.

## What the recipient gets

1. A headline about a useful outcome for you.
2. Your current situation, grounded in relevant observations.
3. A likely challenge, expressed conditionally rather than presented as proven pain.
4. A practical solution you can use.
5. Your alternatives, with honest tradeoffs and the seller as one option.
6. A specific invitation to see the proposed work.

Each brief adapts to the seller's capabilities, prospect, buyer, and supplied evidence. It addresses the recipient as “you” and “your team.” Public signals inform the situation; private qualification logic and scores stay out of the report.

## Branding and generation

The generator uses supplied branding or discovers a logo from the company's public website, with a published site icon as a fallback. If no suitable image is found, the company name remains visible. Discovery does not claim a verified brand kit.

A separate Codex worker performs bounded parallel research and writing. The requested target is GPT-6.1 Sol with Fast mode and low reasoning effort. Live testing found that the installed CLI rejects that model with its current ChatGPT-account login, so the working local service remains on its previous GPT-5.6 Luna model until access is resolved. Vercel hosts the website and finished assets; there is no AI Gateway dependency. Speed is measured per run, not guaranteed.

Current operational limitation: the worker runs on a signed-in Mac through a temporary tunnel. It is a controlled-test setup, not an always-on hosted backend.

## Development

Install dependencies with `npm install`. Use `npm run dev` for local development and `npm run verify` for type checks, tests, worker compilation, and the production build.

## Safety

- No invented statistics, customer stories, quotes, hobbies, or internal problems.
- Inferences remain conditional in normal prose; internal classification labels are not displayed.
- Public documents exclude scores, qualification logic, operator warnings, and the separate outbound draft.
- Gift offers require explicit approval. No gift purchasing or redeemable voucher issuance is implemented.
- Credentials never belong in source control or generated documents.

Deployment addresses, authentication setup, and exact API calls are intentionally omitted from this README. Operator configuration is managed separately.
