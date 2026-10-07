# Personalized assets

Personalized, prospect-facing briefs—not internal account reports or the separate outbound email.

## The required six-part structure

1. Headline.
2. Current situation: verified public facts.
3. Likely problem: a labelled hypothesis, supported by reasoning and sourced comparable-company evidence when available.
4. Solution: useful practical work tied to the seller's actual capabilities.
5. Best alternative options: compare credible approaches with the seller as one option, including fit and tradeoffs.
6. CTA: show something specific; optionally offer an explicitly approved gift.

This supersedes the earlier instruction to keep all seller invitations outside the asset. The CTA belongs in the asset; Task 5 remains a separate introductory email. The generator contract enforces the four middle sections in order, plus a headline and CTA. Gift-offer approval is supplied separately by the caller, never invented by the model.

## Architecture

Clay sends one prompt → the API forwards it to a separate content generator → validated recipient content is stored → Vercel serves the branded page.

**Vercel hosts the website, forwarding API, and finished documents only. There is no AI Gateway dependency or model-billing requirement.** The external generator connection is not configured or verified yet. A prompt for a new company returns an explicit failure until that connection works; it never silently returns the Linear example.

The original `enrichflow-gtm-audit` repository uses a Claude worker configured for the separate OpenClaw Mac. Its pipeline and services are untouched. That older, long-running pipeline is not the new two-minute generator. A connection check to its configured Mac timed out on October 7, 2026; this does not prove that the original worker is stopped.

## Open it

Run `npm install`, then `npm run dev`.

- `/examples/linear-support`: authored Linear reference.
- `/examples/lifecore-wellness`: authored LifeCore wellness coverage plan for fictional Northstar Software.
- `/a/lifecore-northstar-wellness`: same LifeCore reference through the public asset URL contract, with JSON and Markdown download endpoints.
- `/a/linear-support-onboarding`: same reference through the asset URL contract.
- `/api/assets/linear-support-onboarding/download`: complete editable Markdown.
- `/`: operator input guide and JSON-body builder; not an unauthenticated generation form.

Linear now demonstrates this exact structure using public product documentation. Its former training-kit content was replaced after the user explicitly requested the six-part brief. The presentation uses a branded cover, readable text, compact contents, expandable chapters, interactive checks, and editable download. All four brief body sections open by default. The final CTA offers a walkthrough; no gift is promised because none was approved. The example is authored, and SupportLoop is a fictional practice seller.

The visual reference is the newer `avik-gtm/enrichflow-gtm-audit`, not `enrichflow-gtm-playbook`. Branding is recipient-specific. The layout supports tables, cards, steps, checklists, and reusable templates for different industries; it does not force every company into the Linear support content.

The LifeCore example uses the user's corporate-wellness brief: gyms, studios, pools, and classes through one membership. Northstar Software, its office/remote setup, its existing gym arrangement, and its green visual treatment are fictional. It contains a practical coverage check, opt-in pilot checklist, alternatives comparison, and walkthrough CTA—not an outbound/GTM plan for LifeCore. No employee reviews, public company findings, clinical outcomes, network coverage, or comparable-company success story are invented. Linear remains unchanged.

For API reference testing, explicitly send `{"example":"lifecore-wellness"}`. This selects the authored example; it does not generate or modify it. `examples/requests/lifecore-prompt.json` shows a normal prompt request for later generation. The user plans to run generation on Grok bot later; no Grok connection is implemented or required for these examples.

## Input

Send `{"prompt":"your plain-language context"}`. Include product/capabilities, prospect, buyer, observed facts/source text, your reasoning, any genuine comparable-company evidence, and what you can demonstrate in the CTA. Scores, universe filters, LinkedIn URLs, and approved brand assets are optional. You never have to build the output schema yourself. [Exact payload guide](docs/CLAY_REQUEST_GUIDE.md).

The current contract is **supplied-context only**: the separate writer must not claim it visited a website or verified a LinkedIn profile. Pass relevant findings from Clay. Missing evidence means a proposed plan, not fabricated findings. Unsupplied reference and logo URLs are rejected. See [Clay setup](docs/CLAY_SETUP.md).

## Generator connection

`ASSET_GENERATOR_URL` identifies a separately hosted writer accepting `{systemPrompt, input, outputSchema}` and returning generated asset JSON. Hosted requests require `ASSET_GENERATOR_TOKEN`. The forwarding API enforces HTTPS, forbids redirects, times out after 90 seconds, bounds response size, validates the schema, and sanitizes failures.

This adapter is implemented and contract-tested; that is **not** proof of a live connected generator. No new-company output or sub-120-second end-to-end run has been verified. Do not copy the original GTM worker's broad shell/tool permissions into a public endpoint. Deployment of a new worker requires an identified runtime and secure authentication.

The matching [separate Claude writer](worker/README.md) is now implemented in this repository. It runs outside Vercel, uses the checked-in six-part contract, disables model tools/customizations, and enforces bounded authenticated requests. Run `npm run worker:build` and `npm run worker:check` on the intended machine before deployment. The current machine returns `claude_not_signed_in`; no live writer connection has been installed. This is implementation progress, not a successful model-generation run.

## Safety and storage

- Hosted POSTs fail closed without `ASSET_API_KEY`.
- Finished public documents use the dedicated Blob store. No prompts or operator-only data are stored there.
- Public pages, JSON, and downloads exclude scores, research seeds, warnings, and the private `task5Hook`.
- The authored reference remains available without a generator or database.
- Source facts, inferences, and unknowns stay distinct. No fabricated metrics, quotes, hobbies, or purchased gifts.
- Gift fulfillment, arbitrary-company research, and verified brand extraction are not implemented.

## Verify

`npm run verify` runs TypeScript, unit/contract tests, and the production build. Browser verification must also check desktop/mobile layout, section navigation, checklist state, copying, and downloads.

See [implementation plan](PLAN.md), [reference notes](docs/REFERENCE.md), and [current revision record](docs/HOSTING_AND_LAYOUT_REVISION.md). Historical Gateway run records describe a removed architecture, not a current requirement.
