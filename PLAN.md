# Corrected implementation plan

## Complete: one recipient-first support prototype

1. Confirm the newer `enrichflow-gtm-audit` reference.
2. Author a useful support onboarding kit using public Linear documentation.
3. Match the editorial shell: recipient logo/colors, specific cover, work first, supporting research underneath.
4. Add working copy, checklist, and editable-download controls.
5. Keep operator reasoning and Task 5 copy off the public asset.
6. Test content, API, public rendering, and safety boundaries; publish a preview for review.

## In progress: live generation

Direct AI Gateway writing, authentication, and Blob storage have been added. Tests and build pass. The first hosted AccessProof request is blocked by Gateway billing verification (HTTP 403 at Gateway; 503 at the asset API). No generated AccessProof artifact exists yet. Resume after the user enables Gateway access or selects another provider; do not change billing automatically.

The next milestone is not more templates. It is to reproduce this quality for a previously unseen company from one short prompt.

- Complete a live request with the configured direct writer, then connect bounded research separately. The external-service adapter still accepts `systemPrompt`, `input`, and `outputSchema`.
- Extract seller, recipient, buyer, and source material without confusing their roles.
- Choose one useful deliverable based on the problem and evidence, not keyword substitution.
- Fetch a bounded set of public sources and verified brand assets. No private LinkedIn scraping or claimed research when pages are inaccessible.
- Draft the actual work; reject unsupported factual claims and internal qualification leakage.
- Store generated recipient content durably and return the hosted URL plus operator-only outreach hook.
- Measure at least three uncached, real-company runs. Include retrieval, writing, validation, storage, and publication in the <120 second measurement. Report failures and scope reductions.

Do not inherit the old 20–25 minute pipeline and call it a two-minute system. Do not rebuild/install the frontend per prospect. Reuse the deployed renderer and pass validated content.

## Generalize only after the first live case works

Keep the presentation components reusable while allowing the central asset to change. Support kit, comparison, coverage worksheet, and action backlog are examples, not a promise that all are implemented. The first useful artifact should stand on its own without the recipient needing to buy or book a call.

Competition use remains subject to organizer approval and recreation during the monitored build window. This repository is a personal-workspace prototype, not evidence of approval.
