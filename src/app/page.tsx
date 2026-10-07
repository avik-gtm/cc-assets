import { DemoForm } from "@/components/DemoForm";

export default function HomePage() {
  return (
    <main className="studio">
      <p className="eyebrow">Operator workspace · not the prospect’s page</p>
      <h1>Useful work, made personal.</h1>
      <p>
        The first complete reference is a support onboarding kit for Linear. It
        uses the newer GTM playbook’s editorial structure, but gives the
        recipient practical support material instead of a report about your lead
        score.
      </p>
      <section className="studio-preview">
        <div>
          <p className="eyebrow">
            Reference 01 · Source-backed, authored example
          </p>
          <h2>A first-week support kit. Built around Linear.</h2>
          <p>
            Three response drafts, an escalation matrix, a five-day checklist,
            and an editable download.
          </p>
        </div>
        <a className="button" href="/examples/linear-support">
          Open the asset ↗
        </a>
      </section>
      <p className="operator-note">
        This reference is pre-authored, not generated on demand. The prompt
        endpoint still needs an approved generation service for new companies.
        It will now tell you when that service is missing instead of publishing
        a generic fallback as finished work.
      </p>
      <DemoForm />
    </main>
  );
}
