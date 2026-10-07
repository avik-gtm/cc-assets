# Send a personalized-asset request from Clay

## What you provide

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
| URL | `https://enrichflow-personalized-assets.vercel.app/api/assets` |
| Content type | `application/json` |
| Authentication | Saved HTTP API header account: `Authorization` = `Bearer [private asset API key]` |
| Body | `{"prompt":"/Asset context"}` with `/Asset context` inserted using Clay's actual column picker |
| Output | Retain `success`, `assetUrl`, `task5Hook`, and `error` for inspection |

The slash reference above is Clay configuration notation, not a literal value to send outside Clay. Preview the resolved body. String column references need quotes. Keep the key in the saved header account, not a prompt or visible table cell. These settings follow [Clay's HTTP API documentation](https://university.clay.com/docs/http-api-integration-overview). This guide uses manual setup and does not require Sculptor.

After the separate generator is connected, test one row first. Inspect `success` and open its `assetUrl` before running more. Do not claim a successful 200 reference test verifies model generation. Competition use still requires organizer approval and recreation in the monitored window.

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

The API's successful response includes:

- `success: true`
- `assetUrl`: the prospect-facing page with headline → current situation → likely problem → solution → alternatives → CTA.
- `task5Hook`: a separate private starting point for your outbound email.
- `generationMode`: `agent` for genuinely generated content, `reference` for the bundled example.
- `executionTimeMs`: the measured request duration.

**Current status:** the page and reference are live, but the separate content generator is not connected. New-company requests currently return 503 (`generation_not_configured`) after authentication. A 401 means the caller key is missing/wrong, not that JSON is wrong. Do not run a batch yet. The under-120-second target remains unverified.
