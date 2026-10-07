# Prototype verification — 2026-10-07

## Published result

- Asset: https://enrichflow-personalized-assets.vercel.app/examples/linear-support
- Canonical asset route: https://enrichflow-personalized-assets.vercel.app/a/linear-support-onboarding
- Editable download: https://enrichflow-personalized-assets.vercel.app/api/assets/linear-support-onboarding/download
- Vercel deployment: `dpl_CQYhWUUnQuwa8fvLnAuEAsTeXmqf`, status READY, target production.

This is a public, independently authored demonstration. It is not an official Linear publication and was not sent to any prospect. The separate GTM audit repository was not modified.

## Checks completed

- TypeScript check, 22 tests across three test files, and production build passed.
- `git diff --check` passed.
- Public hosted page returned HTTP 200 with the expected title, logo, and response draft. The private Task 5 hook was absent.
- Hosted Markdown download returned HTTP 200 with an attachment filename. A browser download of the local equivalent was saved and inspected: replies, escalation table, checklist, and sources were present.
- Hosted asset-creation POST without configured authentication returned HTTP 401.
- Local arbitrary-prompt generation without a provider returned HTTP 503 instead of publishing placeholder content.
- Desktop and 390 px mobile layouts were visually inspected. At the mobile viewport, document width was 390 px with no horizontal overflow. Temporary viewport overrides were reset.
- Section controls and checklist progress were exercised. Copy success feedback was observed locally; clipboard contents were not independently read back.
- Hosted browser error log was empty at inspection. A deployment-scoped Vercel error-log query for the previous hour returned no matching logs. This is a narrow smoke check, not proof of a monitored production service; persistent monitoring and log drains were not verified.

## Not demonstrated

No live generation provider, arbitrary-company research, automatic branding extraction, gift fulfillment, or under-120-second generation benchmark is configured or claimed. The reference is bundled and survives server restarts. New generated assets require a provider, durable storage, and API authentication.

Competition use still requires organizer approval and compliance with the supervised recreation requirement. Publishing this prototype does not establish that approval.
