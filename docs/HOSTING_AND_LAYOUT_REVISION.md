# Hosting separation and Linear layout — October 7, 2026

## User direction

Vercel is for hosting, not AI Gateway. Initially the user requested a layout-only fix. During this revision the user explicitly specified a new six-part asset: headline, current situation, likely problem, solution, best alternative options with the seller included, and CTA with an optional gift. That latest instruction supersedes preserving the old training-kit content and excluding a public CTA.

## Changes

- Removed Gateway implementation, AI SDK dependency, active configuration examples, and payment/setup diagnostics.
- Kept prompt-first input and strengthened the separate-generator adapter: HTTPS/authentication, no redirects, bounded response size, schema validation, supplied-source checking, sanitized failures.
- Replaced the narrow sidebar with a branded cover, larger type, full-width reading area, compact contents, and expandable chapters. All four brief sections open by default; navigation reveals a chapter; expand/collapse and complete printing remain available.
- Rewrote Linear and the generation instructions to the new six-part structure. Public product facts remain sourced; potential internal problems are hypotheses. SupportLoop is one proposed alternative. No fabricated comparable-company history, capabilities, ROI, or gift promise.
- Added a separately approved gift-offer input, server-authoritative rather than model-authorized. No purchase/fulfillment is performed.
- Kept private scoring, warnings, and Task 5 content out of public outputs.

## Actual generator status

The original repository's setup script and launchd definitions identify a separate OpenClaw Mac running Claude. Its existing pipeline is not modified. The configured SSH host could not be reached during this check. This machine's Claude login was unavailable at inspection. There is no verified hosted writer connection in this project yet.

The adapter tests mock the external service; they do not prove real model generation, research, or the two-minute target. The reference is authored, not a new generated result. Historical Gateway run records are retained as history only.

## Verification

- TypeScript and production build pass; 50 unit/contract tests pass after the format and gift-input changes.
- Local browser: branded cover inspected, collapse/expand works, clicking Solution reopens its chapter, checkbox count updates, and the 390 px viewport has no page-level horizontal overflow. Temporary viewport override reset.
- Production dependency audit: no reported vulnerabilities. Development dependencies were not changed as part of this task.
- Removed the obsolete production `AI_GATEWAY_MODEL` setting from the verified `enrichflow-personalized-assets` project. Caller authentication and Blob settings preserved; no payment or account changes.
- Deployment and published-alias verification are recorded in the task handoff; a successful build alone is not considered deployment verification.
