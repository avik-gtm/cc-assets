# Separate Codex research and writing worker

The website hosts the finished assets. This worker runs **outside Vercel**, using the signed-in Codex CLI to research and write them. No Vercel AI Gateway or Vercel model billing is involved.

## Current setup — October 7, 2026

- The worker runs on the current Mac as `gui/501/io.enrichflow.personalized-assets.worker`, bound to `127.0.0.1:8791`.
- Vercel forwards to a privately configured generator address. Exact endpoint and authentication details are omitted from this README.
- This is a **temporary Cloudflare quick tunnel for testing**, not production uptime. The Mac must remain awake, logged in, and online, and the tunnel process must remain running. Restarting a quick tunnel changes its hostname; update the private Vercel endpoint and redeploy if that happens.
- The worker secret is in ignored `.env.worker.local`. Vercel's original `ASSET_API_KEY` is preserved but masked; `.env.local` does not contain its usable value. The new dedicated caller key `ASSET_OPERATOR_API_KEY` is in ignored `.env.operator.local`. Never print, commit, or paste secrets into a prompt.
- **A Dot is not configured and is not in the timed request path.** The worker, not a Dot wake-up, launches three parallel research subprocesses and one writer.
- The 30–60-second target must be assessed with real end-to-end requests. Process health, reference examples, unit tests, and configured time limits do not prove generation quality or latency.
- A genuine `gpt-5.6-luna` worker generation completed in **45.6 seconds with two independently retrieved Linear sources**. Full website-to-published-page tests succeeded in **53.9 seconds** (foreground) and **50.2 seconds** (background service). Company context was obtained; problem and buyer search branches did not return verified findings before their cutoff. Earlier tests exposed timeouts and a validation failure, since addressed with a larger writer deadline and safe output normalization. These are individual measurements, not a broad speed guarantee. See [live acceptance](../docs/LIVE_TEST_2026-10-07.md).
- `https://cc.getattn.io` is live: DNS, HTTPS, health, and both authored example pages passed checks. Health reports configured generation, not a completed model request.

For a stable deployment, run the worker on an approved always-on host with a persistent HTTPS endpoint. Do not use the temporary tunnel as an availability promise for the live competition.

## Request flow

```text
Clay → website forwarding service → authenticated worker
     → three parallel researchers → evidence checks → one writer
     → website validates and stores the public document → asset URL
```

The three research assignments are company context, problem-specific evidence, and buyer context. They use hosted web search with a shared 20-second research budget, at most two source candidates per branch. Code also retrieves up to two official-site pages in parallel (seven-second cutoff) and extracts their publisher descriptions as baseline company context. Code separately retrieves search candidates over public HTTPS and admits a quote only when it appears in the retrieved text. Unavailable or unverified findings are omitted. For fast baseline retrieval, pass `companyDomain` explicitly in addition to any free-text prompt.

The writer has a 40-second command deadline and uses the supplied context plus admitted source excerpts. It creates a compact six-part brief: headline, current situation, likely problem, solution, alternative options, and CTA. A source matching its quote does not validate every broader inference; unknown internal conditions must remain conditional in the prose. Research branch status and warnings remain operator-only.

The writer can proceed with supplied context when a research branch times out. Check `generation.verifiedSourceCount`, `generation.completedResearchBranches`, and `warnings` in the website response before treating an output as newly researched. No fabricated filler, reviews, comparable-company results, branding, hobbies, or gift approval is allowed.

## Build, check, and run

Use Node.js 22+ and a signed-in Codex CLI supporting the flags checked by `worker:check`:

```sh
npm ci
npm run worker:build
npm run worker:check
```

`worker:check` checks CLI capabilities and sign-in without invoking a model or printing credentials. `ready: true` is not a completed generation test.

Private environment settings:

| Setting | Purpose |
| --- | --- |
| `ASSET_GENERATOR_TOKEN` | Dedicated service secret of at least 32 characters; must match Vercel. Not the Clay caller key. |
| `ASSET_WRITER_MODE` | Defaults to Codex. `claude` explicitly selects the legacy supplied-context-only writer. |
| `ASSET_CODEX_BIN` | Optional absolute Codex binary path; defaults to `codex`. |
| `ASSET_CODEX_MODEL` | Defaults to `gpt-6.1-sol`; all research and writing calls request Fast mode with low reasoning. |
| `ASSET_WORKER_HOST` | `127.0.0.1`; keep the raw Node port private. |
| `ASSET_WORKER_PORT` | Defaults to `8791`. |
| `ASSET_WORKER_CONCURRENCY` | One asset request by default, range 1–3. Each Codex request has three parallel research branches. Excess requests receive 429, not a hidden queue. |

For the existing Mac installation, rebuilding does not restart the running process. After an intentional worker update:

```sh
npm run worker:build
launchctl kickstart -k gui/501/io.enrichflow.personalized-assets.worker
```

The installer is `node scripts/install-local-worker.mjs`; it creates or updates this checkout's dedicated launch agent and private environment file, not the original GTM audit worker. `npm run worker:start` can also run in a foreground process when its private environment has already been loaded. Do not run two workers on the same port.

## Service contract and safeguards

Both process-readiness checks and generation requests require dedicated service authentication. Exact routes and request configuration are maintained in the operator setup, not this README.

The incoming prompt/schema fields are compatibility fields; checked-in system instructions and validation remain authoritative. Codex mode returns `{ "asset": <GeneratedAsset>, "research": { "sources": [...], "branches": [...], "durationMs": 0 } }`. The website accepts newly discovered source URLs only through this authenticated research envelope. Legacy Claude mode returns the generated asset directly and does not research.

Clay calls the website's authenticated forwarding service, not the worker directly. Caller credentials and worker credentials are separate. Never put either into the asset context or source control.

The worker uses isolated temporary directories, read-only execution, no shell, no local file tools, no connectors, and no inherited user plugins or memories. Research gets hosted web search; the writer gets no tools. Sources are untrusted data, never instructions. Source fetches restrict public HTTPS targets, validate DNS, bound response size, and check redirect destinations. Hosting keys and the service token are not passed into model subprocesses.

HTTP input is capped at 512 KB with a five-second upload deadline. Model output is bounded to 1 MB. Disconnects cancel the request's children; shutdown cancels active jobs. The website's forwarding timeout is 90 seconds. Timeouts and invalid outputs return an error, not a generic asset. Normal logs omit raw prompts, process output, and credentials.

## Acceptance checks before live use

1. Send a genuine company prompt through the authenticated website API, with **no `example` field**.
2. Verify `generationMode: agent`, inspect research counts/warnings, then open the published page and Markdown download.
3. Check sources, recipient identity, claims, alternatives, CTA, and branding. Private scores, research seeds, classification labels, and Task 5 copy must not appear publicly.
4. Measure multiple uncached requests from submission to a usable page. Treat 30–60 seconds as a target until the measurements support it; a fast error is not success.
5. Replace the quick tunnel with an approved stable endpoint before depending on unattended availability.

Competition use still requires organizer approval and recreation within the monitored setup window. No gift purchasing is enabled.
