# Document-first structure — 2026-10-07

## User story

Task 1–3 context arrives as one plain-language prompt. The model chooses useful work for the prospect. Task 4 renders that work as a standalone document; Task 5 outreach is a separate private handoff. The operator's input guidance and the recipient's document are different pages.

## Changes

- Replaced the sales-style cover, decorative pitch panel, and email-composer presentation with a branded document header, contents, visible scope, open working sections, and implementation notes.
- Rewrote the authored Linear example as diagnostic playcards, a routing matrix, a five-day onboarding plan, and an internal escalation template. No subject lines, salutations, or seller pitch.
- Updated the shared generation instructions: no email/sales-letter framing, no forced support asset for unrelated products, and seller-to-prospect copy only in private `task5Hook`.
- Retained compatibility for old `replies` data without an email shell. New generation is instructed not to select that layout.
- Updated the Markdown export to stop treating every item value as an email subject.
- Replaced the unauthenticated generation form with a payload builder. It previews and copies exactly one `prompt` field, and explicitly does not execute the request.
- Changed the generic generation failure message so it no longer diagnoses every error as a deadline failure.

## Verification

- Typecheck, all 33 tests, and optimized Next.js production build passed.
- Renderer regression cases cover all six supported asset types and a non-support testing-plan fixture; the fixture is a test, not a live generated asset.
- Local browser inspection confirmed the working-document layout, visible content, brand identity, and no email composer. At a 390 px viewport the document width was also 390 px; no page-level horizontal overflow. Temporary viewport override reset.
- Checklist state changed from 0/2 to 1/2. Copy controls showed success feedback. Browser clipboard readback did not independently confirm the handoff text; do not describe that as end-to-end clipboard verification.
- Expanded operator preview parsed as valid JSON with exactly the `prompt` key. The fictional AccessProof context remained intact. Browser error-log inspection returned no errors.
- Download endpoint returned HTTP 200 with an attachment header, diagnostic content, and routing ownership; no email subject or salutation.
- Public projection and tests continue to exclude Task 5 copy, warnings, qualification context fields, and research seeds.

## Remaining boundary

This verifies the authored document and input/publication contracts, not successful AI generation. The previous live AccessProof request was blocked by Vercel AI Gateway billing verification; no AccessProof asset exists. No payment method, credits, secrets, or provider configuration were changed during this structure fix. The direct writer remains supplied-context-only, with no browsing or LinkedIn enrichment. The sub-120-second generation target remains unverified.
