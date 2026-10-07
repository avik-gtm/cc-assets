import { DemoForm } from "@/components/DemoForm";

export default function HomePage() {
  return (
    <main className="studio">
      <p className="eyebrow">
        Operator workspace · private context stays out of the document
      </p>
      <h1>Your context in. A personalized brief out.</h1>
      <p>
        Task 4 follows your six-part structure: headline, current situation,
        likely problem, solution, alternative options, and a specific CTA. Task
        5 is the separate email that introduces the asset.
      </p>
      <section className="studio-preview">
        <div>
          <p className="eyebrow">
            Authored reference · not an API-generated result
          </p>
          <h2>Linear: a personalized support brief</h2>
          <p>
            Public workflow facts, a clearly labelled hypothesis, a practical
            solution, an honest options comparison, and a walkthrough CTA.
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
          Include sourced examples from similar companies if you want them used.
          No examples supplied means no invented case studies. To include a gift
          offer, add the separate approvedGiftOffer field only after you have
          approved the gift and its terms. It does not purchase a gift.
        </p>
        <p>
          <strong>A domain or LinkedIn URL is not enough for research.</strong>{" "}
          The current writer does not open those pages. Pass the useful findings
          from Clay, not just the links. Without evidence, the result must be a
          proposed plan—not an audit claiming work was performed.
        </p>
      </section>
      <section className="generation-status" aria-labelledby="status-title">
        <h2 id="status-title">Website and content generation are separate</h2>
        <p>
          Vercel hosts the pages, receives Clay requests, and stores finished
          documents. A separate generator writes the content. No AI Gateway is
          used or required.
        </p>
        <p>
          The Linear example works independently of the generator. New-company
          generation still needs a verified connection to the separate service;
          the two-minute target has not yet been measured successfully.
        </p>
      </section>
      <DemoForm />
    </main>
  );
}
