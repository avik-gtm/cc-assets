# Desktop-independent generation

The website forwards authenticated requests to a separate local generator. Closing the ChatGPT/Codex desktop app does not own or stop these launchd services:

- `io.enrichflow.personalized-assets.worker`: authenticated loopback generator and bounded Codex subprocesses.
- `io.enrichflow.personalized-assets.tunnel`: Cloudflare connector and signed endpoint registration.

Both are user LaunchAgents, started at login and restarted by launchd. This is not an always-on cloud backend: the Mac must remain signed in, awake, online, and authenticated with the CLI. Closing the lid, logging out, rebooting before login, revoked credentials, or loss of network can interrupt generation. Existing published reports stay hosted independently.

## Connection recovery

The connector's temporary address changes when it restarts. It checks its authenticated public health endpoint, then publishes a short-lived HMAC-signed record to the existing Blob store. The website reads that record directly from origin on each generation request. The signature binds the exact allowed HTTPS hostname/path and expiry; no credentials or prospect information are published in the record. Missing, modified, oversized, or expired records fail closed, with no fallback to the stale address.

Registration refreshes roughly once per minute and expires after ten minutes. During a restart, a request may fail until registration completes; interrupted generation is not automatically replayed. The connector uses Cloudflare DNS only for its own health check to avoid local ISP negative caching; it does not change system DNS or disable TLS verification.

Cloudflare Quick Tunnels are for development/testing and have no uptime guarantee. Automatic recovery reduces a process-lifetime failure, but is not a substitute for a production tunnel or hosted generator. Official limitations: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

## Install and inspect on this Mac

```sh
npm run worker:build
node scripts/install-local-worker.mjs
node scripts/install-local-tunnel.mjs
launchctl print gui/$(id -u)/io.enrichflow.personalized-assets.worker
launchctl print gui/$(id -u)/io.enrichflow.personalized-assets.tunnel
```

The existing private `.env.worker.local` and `.env.local` files are required. Do not replace them with masked environment exports. The tunnel reads only the worker authentication token/port and the Blob token; Cloudflare subprocesses do not inherit these credentials. Logs and connection status are under the ignored `.runtime` directory. No private keys are stored in source control.

Production uses `ASSET_GENERATOR_DISCOVERY=blob`. Explicit endpoint configuration remains supported when discovery is disabled. The caller-facing API and keys are unchanged. No Dots, model billing gateway, or interactive desktop chat is involved.

The installed runtime currently uses `gpt-5.6-luna` with Fast requested. GPT-6.1 Sol was rejected by the installed CLI/account combination; the default in source is not evidence of the active model. This connection change does not alter model selection.

## Verification on 2026-10-07

- Typecheck, worker build, and production build passed; 144 tests passed.
- Generator and connector were observed with launchd as their parent, not the desktop app or a tool terminal session.
- The connector process was deliberately terminated. launchd restarted it, its hostname changed, and a new signed registration appeared automatically.
- The authenticated generator health check succeeded; unauthenticated access returned 401.
- After the forced restart, the unchanged public API generated `linear-report-ea0c57ca` in 30.3 seconds end-to-end (29.266 seconds server-side), with agent generation and durable Blob storage. The new page rendered in the browser with the Linear logo and the required document sections.
- That run verified two public sources; one of three bounded research branches completed. This timing is one measured run, not a guaranteed latency or complete research coverage.
- The actual desktop app was not quit during this tool-driven test.
