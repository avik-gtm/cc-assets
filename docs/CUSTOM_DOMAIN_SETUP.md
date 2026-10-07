# Publish at cc.getattn.io

## Current status — checked October 7, 2026

- `cc.getattn.io` is attached to Vercel project `enrichflow-personalized-assets` under `avik-ghimires-projects`.
- Vercel project ID: `prj_9lINmbiJg50RKvKhhGaSa4aTOYwI`.
- **The custom domain is live over HTTPS.** Its health endpoint and both example pages returned HTTP 200 after the DNS change. Health reports `storage: blob` and `agentConfigured: true`; that does not itself prove successful asset generation.
- DNS is hosted by **Porkbun**, not Vercel. The authoritative nameservers are `curitiba.ns.porkbun.com`, `fortaleza.ns.porkbun.com`, `maceio.ns.porkbun.com`, and `salvador.ns.porkbun.com`.
- The user completed the explicit `cc` CNAME at Porkbun; DNS resolution was verified against the target below.
- No root-domain settings, nameservers, mail records, or unrelated Vercel projects were changed by this setup.

## DNS record now in place

Managed at Porkbun → Domain Management → `getattn.io` → DNS. No further DNS change is needed while this record resolves and HTTPS remains healthy.

| Field | Value |
|---|---|
| Type | `CNAME` |
| Host / Name | `cc` |
| Answer / Target | `daa71d8c4b15afe6.vercel-dns-017.com` |
| TTL | `600` or Porkbun's default |

This target is the rank-1 recommendation returned by Vercel's domain configuration API for this project, not a guessed generic target. If Vercel displays an updated target later, use the current project-specific recommendation.

Do not add a competing A or AAAA record at `cc`. Do not modify `@`, `*`, nameservers, MX, SPF, DKIM, DMARC, or other subdomains. No nameserver migration, domain transfer, new plan, or new site deployment is required.

## Recheck if needed

From the repository directory:

```bash
dig +short CNAME cc.getattn.io
vercel api /v9/projects/prj_9lINmbiJg50RKvKhhGaSa4aTOYwI/domains/cc.getattn.io --scope avik-ghimires-projects --raw
vercel api /v6/domains/cc.getattn.io/config --scope avik-ghimires-projects --raw
curl --fail --show-error https://cc.getattn.io/api/health
```

The DNS answer should be the target above, Vercel should report `misconfigured: false`, and HTTPS should load without a certificate warning. DNS and automatic certificate issuance may take additional time; do not call the domain ready based on `verified: true` alone.

Open both reference pages and a genuinely generated asset:

- `https://cc.getattn.io/examples/lifecore-wellness`
- `https://cc.getattn.io/examples/linear-support`
- `https://cc.getattn.io/a/<generated-slug>`

The original `https://enrichflow-personalized-assets.vercel.app` hostname remains available too. Real generated-asset acceptance is separate from DNS/HTTPS verification.

## Clay endpoint

Change only the host in the existing request URL:

```text
POST https://cc.getattn.io/api/assets
```

Keep `Content-Type: application/json` and the prompt-first JSON body. The bearer header accepts the preserved primary `ASSET_API_KEY` or the dedicated `ASSET_OPERATOR_API_KEY`; the new local operator key is held privately in `.env.operator.local`. Do not paste API secrets into this document or GitHub.

The API uses the request's origin for returned asset URLs unless `NEXT_PUBLIC_APP_URL` is explicitly configured. If a canonical public URL is desired for requests made through either hostname, set `NEXT_PUBLIC_APP_URL=https://cc.getattn.io` only after HTTPS is verified, then redeploy. This optional canonical setting is not required when Clay calls `https://cc.getattn.io/api/assets` directly and no overriding value exists.
