# Clay setup: test one real prospect

The website forwards to a separate **Codex research-and-writing worker**, not Vercel AI Gateway. A Dot is not configured or required for this request path. The current worker connection uses a temporary tunnel to the signed-in Mac: keep the Mac and tunnel online. This is a test connection, not guaranteed production availability. See [worker operations and limits](../worker/README.md).

## Configure the HTTP request

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://cc.getattn.io/api/assets` |
| Content type | `application/json` |
| Saved authentication header | `Authorization: Bearer [private primary or operator API key]` |
| Body | `{"prompt":"[context from the current Clay row]"}` |

Use Clay's actual column picker and preview the resolved JSON. Do not send literal bracket placeholders, concatenate unescaped JSON, or put secrets in table cells/prompts. The original `ASSET_API_KEY` is preserved in Vercel but sensitive/masked; `.env.local` does not contain its usable value. A dedicated `ASSET_OPERATOR_API_KEY` is also accepted and stored privately in `.env.operator.local`. Use a saved HTTP account for the chosen caller key. Do not pass the worker service token to Clay.

To test from this checkout without displaying a secret, the helper reads the private operator key and defaults to `https://cc.getattn.io`:

```sh
npm run asset:generate -- examples/requests/linear-live-test.json
```

For your own prospect, replace the argument with a request JSON file using the format below. This makes a real generation request, not an authored-reference lookup.

One prompt can contain everything:

```text
Seller/product: [what we sell and verified capabilities]
Prospect: [company name and domain]
Universe/ICP: [why this type of account is relevant]
Buyer: [role; person's name/profile optional]
Signals: [actual observations, counts, dates, source URLs and supporting text]
My reasoning: [why the signals may matter, not a claim of proven internal pain]
What we can show: [specific demo, audit, or walkthrough]
Find relevant missing public context, then create our six-part prospect-facing brief.
Keep targeting, scoring, internal classifications, and the outbound draft private.
```

You do not need to construct the output schema. Separate optional fields are explained in [the request guide](CLAY_REQUEST_GUIDE.md).

## Verify the result

For a real run, **omit `example`**. That field selects a fixed authored reference and bypasses generation.

After one request, check:

- `success: true`, `generationMode: agent`, and a working `assetUrl`.
- `generation.researchMode`, `verifiedSourceCount`, and `completedResearchBranches` for actual research coverage. An incomplete branch means research did not supply verified evidence for that assignment within the deadline, not that the prospect lacks the characteristic.
- `warnings` for limitations and `executionTimeMs` for measured request time. The 30–60-second target is not a guarantee.
- The page and its Markdown download: correct prospect, useful content, supported claims, and no private targeting data.

`task5Hook` is a separate private outbound starting point. It is not part of the public asset. The finished asset has headline → current situation → likely problem → solution → alternatives → CTA.

The worker launches three parallel research branches and a writer. It may proceed using supplied context when public research is unavailable, and it never treats inaccessible LinkedIn pages or an inferred pain as a verified finding. Supplying good existing evidence makes the result stronger and reduces dependence on fresh research.

A `401` means the caller key is missing or wrong. A `503` means the generation service could not complete the request; no generic placeholder is published. Test one row before a batch; the worker accepts one asset job at a time by default.

## Custom domain

`cc.getattn.io` is live: DNS, HTTPS, the health endpoint, and both example pages were verified. Use `https://cc.getattn.io/api/assets`. The original Vercel hostname remains available. See [custom-domain details](CUSTOM_DOMAIN_SETUP.md).

Competition use requires organizer approval and recreation in the monitored setup window. Gift offers require explicit approval; no purchasing or redeemable gift issuance is enabled.
