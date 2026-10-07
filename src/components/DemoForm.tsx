"use client";

import { FormEvent, useState } from "react";

const samplePrompt = `Product: SupportLoop helps software companies coordinate customer-support QA, escalation, knowledge, and workforce operations.
Problem solved: Keeping support quality and knowledge consistent as commercial demand and the support team change.
Universe: US B2B software companies with 500-2,000 employees and at least one active support opening.
Signal: The company has eight active sales openings and four active customer-support openings.
Verified evidence: The careers page currently lists eight sales and four customer-support openings.
Signal logic: Additional sales capacity may increase customer and support complexity; this is a hypothesis, not proof that support is broken.
Buyer: VP Customer Support or Support Operations.
Company: Acme.
Domain: acme.com.
Create the most useful personalized asset for this situation.`;

type Result = { success: boolean; assetUrl?: string; assetTitle?: string; error?: string };

export function DemoForm() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const payload = (await response.json()) as Result;
      setResult(payload);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="demo-form" onSubmit={handleSubmit}>
      <label htmlFor="asset-prompt">Asset context</label>
      <textarea
        id="asset-prompt"
        name="prompt"
        rows={15}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <button className="button" type="submit" disabled={loading || !prompt.trim()}>
        {loading ? "Building asset…" : "Generate preview"}
      </button>
      {result ? (
        <div className={`form-result ${result.success ? "success" : "error"}`} aria-live="polite">
          {result.success && result.assetUrl ? (
            <>
              <span>Created: {result.assetTitle}</span>
              <a href={result.assetUrl}>Open personalized asset →</a>
            </>
          ) : (
            <span>{result.error || "Generation failed."}</span>
          )}
        </div>
      ) : null}
    </form>
  );
}
