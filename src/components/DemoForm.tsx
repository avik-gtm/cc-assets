"use client";

import { FormEvent, useState } from "react";

const samplePrompt = `Product: SupportLoop helps software companies coordinate customer-support QA, escalation, knowledge, and workforce operations.
Problem solved: Keeping support quality and knowledge consistent as commercial demand and the support team change.
Universe: US B2B software companies with 500-2,000 employees and at least one active support opening.
Signal: For this practice scenario only, imagine simultaneous sales and support hiring. This has NOT been verified for Linear.
Signal logic: New support hires may benefit from onboarding material. Do not assert a backlog or a performance problem.
Buyer: VP Customer Support or Support Operations.
Company: Linear.
Domain: linear.app.
Source URLs: https://linear.app/docs/invite-members, https://linear.app/docs/members-roles, https://linear.app/docs/triage
Create product-specific response drafts, a proposed escalation matrix, and a first-week practice checklist. Keep my scoring and qualification private.`;

type Result = {
  success: boolean;
  assetUrl?: string;
  assetTitle?: string;
  error?: string;
  generationMode?: string;
  executionTimeMs?: number;
  warnings?: string[];
};

export function DemoForm() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(reference: boolean) {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          reference ? { example: "linear-support" } : { prompt },
        ),
      });
      const payload = (await response.json()) as Result;
      setResult(payload);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="demo-form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <label htmlFor="asset-prompt">Asset context</label>
      <textarea
        id="asset-prompt"
        name="prompt"
        rows={15}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <div className="studio-actions">
        <button
          className="button"
          type="button"
          disabled={loading}
          onClick={() => void submit(true)}
        >
          Test API with authored reference
        </button>{" "}
        <button
          className="button"
          type="submit"
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Working…" : "Generate from prompt"}
        </button>
      </div>
      <p className="operator-note">
        The reference API test ignores the editable prompt and returns the saved
        example. New prompt generation requires a configured service. On a
        protected deployment, call the API from Clay with your bearer key; this
        public form does not store credentials.
      </p>
      {result ? (
        <div
          className={`form-result ${result.success ? "success" : "error"}`}
          aria-live="polite"
        >
          {result.success && result.assetUrl ? (
            <>
              <span>Created: {result.assetTitle}</span>
              <span>
                Mode: {result.generationMode} · {result.executionTimeMs} ms
                (reference retrieval is not AI generation time)
              </span>
              {result.warnings?.map((warning) => (
                <span key={warning}>{warning}</span>
              ))}
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
