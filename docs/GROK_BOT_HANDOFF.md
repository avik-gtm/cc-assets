# Give this setup task to Grok bot

The private repository is https://github.com/avik-gtm/enrichflow-personalized-assets. Grok bot needs authorized access to it. This is a setup handoff, not a new prospect-generation prompt. No secrets belong in the message below.

The website and authored Linear/LifeCore examples are already hosted. The separate generator still needs connecting. The existing `worker/` uses Claude Code; it is not a built-in Grok/xAI connector. “Grok bot” here means the user's automation agent; confirm its actual runtime rather than assuming a model provider.

Copy this message:

```text
Set up the existing EnrichFlow personalized-asset generator so I can send prospect context from Clay and receive a hosted asset URL.

Repository: https://github.com/avik-gtm/enrichflow-personalized-assets
Website: https://enrichflow-personalized-assets.vercel.app

1. Clone/pull the latest main using your existing authorized GitHub access. Read AGENTS.md, README.md, worker/README.md, docs/CLAY_REQUEST_GUIDE.md, src/lib/schemas.ts, src/lib/generation/system-prompt.ts and src/lib/generation/context-rules.ts. If access is missing, tell me the specific access step; never ask me to paste secrets into this chat.

2. Keep the current site, recipient branding, layout, Linear example and LifeCore example. Do not rebuild the project from scratch or touch enrichflow-gtm-audit. Preserve the six-part structure: headline; current situation; likely problem; practical solution; alternative options including the seller; specific walkthrough CTA. This is a useful document for the prospect, not an internal report or an email. Task 5's outbound hook stays private.

3. Use the supplied signals AND broader company context in Current situation. Distinguish supported observations from our reasoning. Use natural conditional language where appropriate, not headings/badges like Inference, Pain unknown, or Hypothesis to validate. Never invent metrics, case histories, source URLs, reviews, hobbies or gift approval. The supplied-context writer does not browse; do not claim it researched a company just because a domain or LinkedIn URL was provided.

4. Inspect your actual hosting/runtime and available generation engine. The supplied worker is Claude-specific. Reuse it only if Claude Code is available and authenticated on the approved machine; otherwise explain the small adapter needed for your available engine before switching providers or adding paid infrastructure. Generation must run outside Vercel. No Vercel AI Gateway or model billing.

5. Preserve the existing generator contract: authenticated POST /generate receives {input, systemPrompt, outputSchema} and returns the GeneratedAsset JSON directly. Keep the checked-in writing rules authoritative. Preserve schema/source validation, request limits, cancellation, concurrency limits and the 80-second generation budget. Host only through an approved authenticated HTTPS route; do not expose the unencrypted worker port. Store secrets privately.

6. Connect the website's ASSET_GENERATOR_URL and ASSET_GENERATOR_TOKEN to that approved service. Scope any Vercel changes to enrichflow-personalized-assets under avik-ghimires-projects. Do not rotate the existing Clay caller key or expose it. Vercel only forwards the request, stores the completed asset and hosts its page. Do not rebuild/deploy the site per prospect.

7. Preserve POST https://enrichflow-personalized-assets.vercel.app/api/assets with Authorization: Bearer [saved private caller key] and JSON {"prompt":"..."}. Optional signal, verifiedEvidence and signalLogic strings already exist. The response must include assetUrl and the private task5Hook.

8. Run npm ci and npm run verify. Perform a genuine new-prospect model request through the website API WITHOUT the example selector. Check the published page, public JSON and Markdown download; ensure internal labels, scoring logic and private Task 5 content do not leak. Confirm generationMode is agent. The bundled examples and mocked tests do not count as model generation. Measure three fresh requests before claiming the under-120-second goal is met.

Return: which engine runs the writer, what is actually connected, a real generated asset URL, measured timings, and the exact Clay request body/header setup. If blocked, give me the smallest specific action needed; do not claim the connection works. Competition use still requires organizer approval and recreation in the monitored setup period.
```

After setup, use the context format in [CLAY_REQUEST_GUIDE.md](./CLAY_REQUEST_GUIDE.md). [The LifeCore request](../examples/requests/lifecore-prompt.json) is a fictional practice input for a real generation test; `{"example":"lifecore-wellness"}` only returns the prewritten reference.
