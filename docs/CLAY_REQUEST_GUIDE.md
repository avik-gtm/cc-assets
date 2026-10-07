# Send a personalized-asset request from Clay

## What you provide

`companySummary` is an optional string (up to 15,000 characters) describing the **recipient company**: what it sells, who its customers are, and relevant workflows. Map your company-summary column here, not into the seller's `productDescription`. It is used alongside signals in Current situation and to tailor the problem, solution and alternatives. Supplied context does not independently prove hiring, growth, performance or internal pain. Aliases: `company_summary`, `recipientCompanySummary`, `prospect_company_summary`.

Recommended structured fields (all text unless noted): `productDescription`, `companyName`, `companyDomain`, `recipientName`, `recipientTitle`, `universe`, `icp`, `signal`, `verifiedEvidence`, `signalLogic`, and `prompt` for specific instructions or what you can demonstrate. `sourceUrls` is an array of HTTPS URLs. Optional `personLinkedInUrl` and `companyLinkedInUrl` are research seeds, not proof. Optional `logoUrl` is an HTTPS image URL; otherwise the worker discovers a published company logo or site icon from `companyDomain`. Optional `ctaUrl` is your actual booking/demo URL. Omit unavailable fields rather than inventing values.

All new reports address the recipient directly as “you” and “your team.” Code defaults to `gpt-6.1-sol` with Fast requested and low reasoning, but a live test showed the current CLI's ChatGPT login rejects that model. The local worker therefore retains its previous `gpt-5.6-luna` override until access is resolved. The signed-in Codex worker is the runtime, not a desktop Dot.

You provide the context, not the finished six sections. Put this in an `Asset context` column, using your real row values:

```text
Seller/product: [name, description, and capabilities it actually has]
Prospect: [company name and domain]
Buyer: [name/title; LinkedIn is optional context, not verified evidence]
Task 1 universe: [filters you chose]
Task 2 observations: [actual signal values, relevant source text, URLs and dates]
My reasoning: [why the signal may matter; label the hypothesis]
Task 3 buyer logic: [why this role owns the issue]
Comparable-company evidence: [a genuine example and source, or None supplied]
What we can show: [the actual demo, audit, sample, or walkthrough]
Branding: [verified logo URL/colors if available]
Create the brief in our six-part format. Keep scores and qualification reasoning private.
```

For the support example: sales hiring plus support hiring may suggest preparing for growth; it does not prove customer growth, more tickets, or poor support. Include actual opening counts and sources only if you have them. Similar-company results need evidence; otherwise the writer must explain a conditional mechanism without inventing a case study.

## How the signals become prospect-facing content

Pass the actual observations, not only a score. The writer combines relevant evidence-backed signals with company context in **Current situation**. Your private explanation of why those signals matter helps shape **Likely problem**, but is not copied as targeting/scoring commentary.

For example, if supplied evidence establishes sales and support openings, Current situation can say the company is recruiting in both functions. Likely problem can explain that, **if customer onboarding grows**, maintaining consistent support handoffs may become more important. Hiring alone does not establish increased customer or ticket volume.

Keep `fact`, `inference`, and `unknown` as internal classifications. The page, public JSON, and download do not expose those labels. Headings describe the prospect's decision or action; uncertainty stays in ordinary sentences such as “This may…” or “If…”. Fictional examples remain explicitly marked.

You can include everything in `prompt`, or separate observations from reasoning using the existing string fields:

```json
{
  "prompt": "[Seller, prospect, buyer, company context and what we can show.]",
  "signal": "[Actual observation, count and date if known; not just a priority score.]",
  "verifiedEvidence": "[Supporting source text and exact source URLs, or explicitly identify fictional practice inputs.]",
  "signalLogic": "[Private explanation of why the observation may matter.]"
}
```

These are placeholders to replace, not a ready-to-research company request. The Codex worker adds bounded public research for company context, product-relevant evidence, and buyer context. It independently retrieves candidate sources and admits only matching excerpts. It does not guarantee access to LinkedIn or every supplied URL; your existing source text and dated observations remain valuable. The `signals` alias also accepts a string; use the canonical `signal` field above. Separate fields are optional.

## Simplest JSON body

```json
{
  "prompt": "Seller/product: [product and verified capabilities]. Prospect: [company and domain]. Buyer: [role]. Public observations: [facts and source text/links]. My hypothesis: [reasoning]. Comparable-company evidence: [evidence or none]. What we can show: [specific walkthrough]. Create our six-part brief."
}
```

Only `prompt` is needed. The website's operator page has a text box and **Copy JSON body** button that safely escapes line breaks and quotes. It prepares the request; it does not run generation. Do not ask an AI to invent facts just to fill a payload. A separate AI formatting step is optional, not required.

## Configure Clay once

Add **HTTP API** enrichment and use **Configure** (manual). Set:

| Setting | Value for this project |
| --- | --- |
| Method | `POST` |
| URL | `https://cc.getattn.io/api/assets` |
| Content type | `application/json` |
| Authentication | Saved HTTP API header account: `Authorization` = `Bearer [private primary or operator API key]` |
| Body | `{"prompt":"/Asset context"}` with `/Asset context` inserted using Clay's actual column picker |
| Output | Map `success` to a checkbox, `assetUrl` to a URL, and `executionTimeMs` to a number |

The slash reference above is Clay configuration notation, not a literal value to send outside Clay. Preview the resolved body. String column references need quotes. Keep the key in the saved header account, not a prompt or visible table cell. These settings follow [Clay's HTTP API documentation](https://university.clay.com/docs/http-api-integration-overview). This guide uses manual setup and does not require Sculptor.

The primary `ASSET_API_KEY` is preserved in Vercel but masked; `.env.local` does not contain its usable value. The additional `ASSET_OPERATOR_API_KEY` is stored privately in `.env.operator.local` and is accepted by the same endpoint. Never print or put it in JSON. For a local test that reads the key automatically, run `npm run asset:generate -- examples/requests/linear-live-test.json`, or substitute your own request JSON path.

Test one row first. **Omit `example` for real generation**; an example request returns fixed authored content. Inspect `success` and `executionTimeMs`, then open `assetUrl` and check the content before running more. Competition use still requires organizer approval and recreation in the monitored window.

## Optional gift offer and CTA destination

Only when you have explicitly approved a gift, add a top-level field:

```json
{
  "prompt": "[The same full context as above]",
  "approvedGiftOffer": {
    "label": "a coffee gift card",
    "policyNote": "Only where your company policy permits."
  }
}
```

That is an example, not a currently approved gift. Omit the entire field if no gift is approved. It adds offer wording; it does not buy, issue, or attach a redeemable card. The model cannot approve its own gift offer. `giftPreference` alone does not authorize one. No hobby research is performed automatically.

Optionally supply `ctaUrl` with your actual HTTPS booking/demo URL. Without one, the brief contains the invitation as text, not a fake button destination. The writer may only use a supplied link.

## What comes back

The API response contains exactly three fields:

- `success: true`
- `assetUrl`: the prospect-facing page with headline → current situation → likely problem → solution → alternatives → CTA.
- `executionTimeMs`: the measured request duration in milliseconds.

Failures have the same three keys: `success: false`, `assetUrl: null`, and elapsed time, with a non-success HTTP status. Diagnostic details are retained in server logs, not returned to Clay. No title, slug, outbound hook, research metadata, storage metadata, or warnings are returned. Older verification reports in this repository record historical responses, not the current contract.

**Current setup:** Vercel is connected to the separate signed-in Codex worker through a temporary Cloudflare quick tunnel. The Mac must stay awake/online and the tunnel running. A Dot is not configured and does not sit in the timed path. The research budget is 20 seconds shared across three parallel branches, followed by a 30-second writing deadline; these are limits, not proof of a successful 30–60-second run. Measure real requests and inspect their content. Do not count a fast error or authored reference as success.

A `401` means the caller key is missing/wrong, not that JSON is wrong. A `503` means generation could not finish, including exhausted worker capacity; the API publishes no generic fallback. You can send **10 simultaneous per-prospect requests**. Do not send an array: each request keeps its existing body and three-field response. Extra requests are rejected rather than queued. See [worker setup](../worker/README.md) for resource and temporary endpoint availability limits.

`cc.getattn.io` is live and verified for DNS/HTTPS, health, and both examples. Use it as the primary Clay hostname. See [custom-domain details](CUSTOM_DOMAIN_SETUP.md). Generation quality and timing still require inspection of real output, not only a healthy website.
