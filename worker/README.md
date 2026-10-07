# Separate Claude writer

This is the content-writing part of the personalized-asset system. It runs on a **separate, approved machine with Claude Code signed in**. It is not a Vercel Function, an AI Gateway integration, or a replacement for the original GTM audit worker.

## Current status

Implemented and locally tested: authenticated HTTP transport, restricted process invocation, structured-output validation, cancellation, time limits, and error handling. Tests use authored fixture content and Node subprocesses; they are **not real model generation**. The installed Claude CLI on the current Mac fails the sign-in check. The configured original OpenClaw Mac was not reachable at the latest check.

No public writer endpoint has been deployed. New-company creation on the hosted asset site remains unavailable. No source retrieval, hobby research, gift fulfillment, or sub-120-second run is claimed.

## Run on the approved machine

From the repository, with Node.js 22+ and dependencies installed:

```sh
npm run worker:build
npm run worker:check
```

The check verifies supported CLI flags and sign-in status without running a model or printing credentials. A `ready: true` check is not a successful generation test. If it returns `claude_not_signed_in`, sign in to Claude on that machine before continuing. A browser Claude session does not establish that the CLI is signed in.

Configure these private environment values through the machine's service manager:

| Setting | Purpose |
| --- | --- |
| `ASSET_GENERATOR_TOKEN` | A dedicated secret of at least 32 characters; match it in the website's private configuration. Do not reuse the Clay caller key. |
| `ASSET_CLAUDE_BIN` | Optional absolute Claude binary path; defaults to `claude` in PATH. |
| `ASSET_WORKER_HOST` | Defaults to `127.0.0.1`; change only for an approved, protected deployment. |
| `ASSET_WORKER_PORT` | Defaults to `8791`; separate from the original worker's port. |
| `ASSET_WORKER_CONCURRENCY` | Defaults to one active job; range 1–3. Extra jobs receive 429, not a hidden queue. |

Then run `npm run worker:start`. It refuses to start without supported CLI flags, a signed-in CLI, and a sufficiently long service token. It does not install a background service, set up a tunnel, change login state, or open a public endpoint automatically.

For hosted use, place this service behind the approved host's HTTPS endpoint and request-size/rate limits. Keep the loopback binding when using a local reverse proxy. Do not expose the unencrypted Node port publicly. Set the site's `ASSET_GENERATOR_URL` to that exact HTTPS `/generate` URL, and its private `ASSET_GENERATOR_TOKEN` to the matching secret. No model key belongs in the browser or Clay prompt.

Use a dedicated service account without organization-managed execution hooks. Safe mode disables user customizations but cannot override administrator policies. No broad original GTM-worker permissions or credentials are needed. An existing Claude session may use its own keychain; the service does not extract, copy, or log it.

## HTTP contract

Both routes require `Authorization: Bearer [private service token]`:

- `GET /health`: process readiness and active-job count. Not a model/auth recheck.
- `POST /generate`, `Content-Type: application/json`: `{ "input": { "prompt": "..." }, "systemPrompt": "...", "outputSchema": {...} }`.

`systemPrompt` and `outputSchema` are accepted for compatibility with the site, but the writer uses the **checked-in** writing rules and schema. An incoming request cannot replace them or choose a command. Success returns the generated asset JSON directly, as expected by the existing forwarding API. Only that API stores the recipient-safe result and returns the hosted URL. Do not expose this service directly to Clay; Clay continues to use `/api/assets` on the website.

Limits: 512 KB request, 5 seconds to upload, 80 seconds per Claude command, 1 MB combined command output, and up to one second to force-close an unresponsive child. An HTTP disconnect aborts the corresponding child. Shutdown cancels active jobs and waits for them to close. There is no automatic retry; retries must stay within the competition time budget.

Errors contain short codes only: `unauthorized`, `invalid_request`, `request_too_large`, `writer_busy`, `claude_generation_failed`, `generation_timeout`, and `generation_invalid_output`, among others. Raw CLI output, prompts, and secrets are not logged or returned on failure. Logs contain startup/readiness status only; there is no request log or persisted conversation in this service.

## Restricted generation

The service launches Claude without a shell, passes prospect context through stdin, and uses an empty private temporary working directory. It disables built-in tools, MCP tools, skills, user customizations, Chrome, permission prompts, and session persistence. It does not pass hosting keys or the service token into the child environment. Authentication and normal model selection remain with Claude.

The model receives the supplied context only. It cannot browse LinkedIn or fetch branding. Supply real observations/source excerpts and approved brand URLs from Clay. A URL by itself is not verified evidence. A proposed solution is not a proven result, and matching the JSON schema does not prove factual accuracy.

Structured output must have the exact six-part structure. Both the writer and website validate it, check reference URLs against supplied input, and prevent model-created gift approval. No fallback prose or authored Linear result can masquerade as newly generated content.

These invocation choices follow the official [Claude CLI reference](https://code.claude.com/docs/en/cli-reference) and [structured-output documentation](https://code.claude.com/docs/en/headless). The local CLI help is checked at startup because flags vary by installed version.

## Required live acceptance test

1. On the approved machine, pass `worker:check` and start the service privately.
2. Complete one real supplied-context request and inspect its sources, hypotheses, alternatives, CTA, and branding. Never count the fixture tests as this step.
3. Connect the approved HTTPS service to the website. Submit the normal prompt-only JSON through the authenticated website API; inspect the published URL and Markdown download, not just a 200 response.
4. Test three uncached real-company requests. Measure from request start through published-page verification. Include any evidence-gathering time separately and in the total workflow, since this writer itself does not research.
5. Only claim the 120-second target after the measured runs support it. If a request is missing evidence or times out, report that; do not publish generic filler.

Competition use still needs organizer approval and recreation within the monitored setup period. This code is a prototype, not evidence of that approval.
