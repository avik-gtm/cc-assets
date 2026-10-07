import { DemoForm } from "@/components/DemoForm";

export default function HomePage() {
  return (
    <main className="studio">
      <p className="eyebrow">
        Operator workspace · private context stays out of the document
      </p>
      <h1>Build the asset. Keep the email separate.</h1>
      <p>
        Task 4 is a useful working document for the prospect: a plan, report,
        map, comparison, or toolkit. Task 5 is the message that introduces it.
        They are different outputs.
      </p>
      <section className="studio-preview">
        <div>
          <p className="eyebrow">
            Authored reference · not an API-generated result
          </p>
          <h2>Linear: support operations field guide</h2>
          <p>
            Diagnostic playcards, an escalation routing matrix, a five-day
            onboarding plan, and a reusable handoff template. No email framing.
          </p>
        </div>
        <a className="button" href="/examples/linear-support">
          View document ↗
        </a>
      </section>
      <section className="input-guide" aria-labelledby="input-title">
        <h2 id="input-title">What to pass</h2>
        <p>For a useful result, put these five things in one prompt:</p>
        <ol>
          <li>
            <strong>Product:</strong> what the seller does and the problem it
            helps solve.
          </li>
          <li>
            <strong>Prospect:</strong> the company name and domain, if known.
          </li>
          <li>
            <strong>Buyer:</strong> the selected person’s role; name is
            optional.
          </li>
          <li>
            <strong>Observed facts:</strong> the signal, relevant data, source
            text, and source links. Say what is unknown or hypothetical.
          </li>
          <li>
            <strong>Your reasoning:</strong> why those facts matter to this
            buyer. Keep this distinct from verified evidence.
          </li>
        </ol>
        <p>
          Optional: Task 1 filters, score and scoring logic, a preferred asset
          type, approved logo URL/colors, or relevant profile information.
          Scores and qualification notes guide the writer but stay off the
          prospect’s document.
        </p>
        <p>
          <strong>A domain or LinkedIn URL is not enough for research.</strong>{" "}
          The current writer does not open those pages. Pass the useful findings
          from Clay, not just the links. Without evidence, the result must be a
          proposed plan—not an audit claiming work was performed.
        </p>
      </section>
      <section className="generation-status" aria-labelledby="status-title">
        <h2 id="status-title">Model connection: setup still required</h2>
        <p>
          Last checked October 7, 2026, against this project in Avik Ghimire’s
          projects. Hosting is working. A fresh model test returned AI Gateway’s
          “valid credit card on file” verification requirement. This is specific
          to the model service—not an overdue hosting bill or a different Vercel
          account.
        </p>
        <p>
          The original GTM playbook uses a local Claude worker, so it does not
          test this new Gateway connection. The workspace owner can review{" "}
          <a
            href="https://vercel.com/avik-ghimires-projects/~/ai-gateway"
            target="_blank"
            rel="noreferrer"
          >
            AI Gateway setup
          </a>{" "}
          or connect an approved alternative. No payment settings were changed,
          and no AccessProof asset was generated. The two-minute target is still
          unverified.
        </p>
      </section>
      <DemoForm />
    </main>
  );
}
