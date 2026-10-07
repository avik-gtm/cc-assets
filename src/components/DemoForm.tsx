"use client";

import { useState } from "react";
import { CopyButton } from "./AssetActions";

const samplePrompt = `Product: AccessProof helps digital teams test websites and applications for accessibility problems and coordinate remediation.
Prospect: Northstar Commerce, a fictional online retailer. No real domain supplied.
Buyer: Head of Digital Product.
Observed facts: None about this fictional prospect. A checkout redesign is a hypothetical practice scenario, not a verified event. No accessibility audit has been performed.
My reasoning: A redesign is a useful moment to plan accessibility testing. It is not proof of existing defects.
Known capabilities: testing customer-facing websites and applications for accessibility problems and coordinating remediation. No other capabilities are verified.
Similar-company evidence: None supplied; do not invent a case study.
Create the six-part brief: headline, current situation, likely problem, solution, best alternative options (include AccessProof as one option), and a CTA offering a walkthrough of the proposed checkout testing plan. Label this fictional practice scenario. No invented findings, sources, metrics, or brand identity. No gift approved. Keep qualification and the separate outbound email private.`;

export function DemoForm() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const payload = JSON.stringify({ prompt }, null, 2);
  return (
    <section className="demo-form" aria-labelledby="payload-title">
      <h2 id="payload-title">One prompt in. A document URL out.</h2>
      <p className="operator-note">
        This prepares the request only; it does not call the generator. The
        example is deliberately fictional.
      </p>
      <label htmlFor="asset-prompt">Your context, in plain language</label>
      <textarea
        id="asset-prompt"
        name="prompt"
        rows={12}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <div className="payload-preview">
        <p className="endpoint">
          POST /api/assets · Content-Type: application/json
        </p>
        <p className="operator-note">
          Authenticate from Clay with Authorization: Bearer [your private API
          key]. Never put that key in this prompt.
        </p>
        <details>
          <summary>Preview the exact JSON body</summary>
          <pre>{payload}</pre>
        </details>
      </div>
      <CopyButton text={payload} label="Copy JSON body" />
      <p className="operator-note">
        The simplest body has only one field: prompt. You do not need to design
        the output JSON or write the six sections yourself. A successful API
        response includes only success, assetUrl, and executionTimeMs.
      </p>
    </section>
  );
}
