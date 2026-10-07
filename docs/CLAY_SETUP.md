# Clay setup — recreate during the monitored 30 minutes

## Minimum live build

1. Add the approved API key.
2. Create one AI column named `Asset Request Prompt`.
3. Map the product brief, Task 1 universe, Task 2 signal and logic, Task 3 buyer, company domain, and LinkedIn URLs.
4. Create one HTTP API column that POSTs the prompt to `/api/assets`.
5. Map `assetUrl` into a text/URL column.
6. Test one row before running the final prospects.

## Prompt for the Clay AI column

```text
Create one concise request for a personalized prospect asset.

Include these labeled fields exactly when data exists:
- Product
- Problem solved
- Prospect company
- Company domain
- Company LinkedIn
- Universe and why this company qualified
- Signal
- Verified evidence
- Signal logic or hypothesis
- Score and score reasons
- Selected buyer
- Why this buyer owns the problem
- Person LinkedIn
- Source URLs

Do not create the asset. Do not invent missing information. Clearly label hypotheses as hypotheses. Return plain text, not Markdown and not a JSON object.
```

## HTTP request

The easiest body is:

```json
{
  "prompt": "{{Asset Request Prompt}}"
}
```

Headers:

```text
Authorization: Bearer {{approved secret}}
Content-Type: application/json
Idempotency-Key: {{Company Domain}}-{{Person LinkedIn}}
```

## Why plain text works

The API accepts one prompt and normalizes it into the internal schema. Clay does not need to construct the full asset document or escape a deeply nested JSON object.
