import { DemoForm } from "@/components/DemoForm";

const principles = [
  ["01", "Prompt in", "Paste one plain-language prompt from a Clay AI column. Structured JSON is optional."],
  ["02", "Evidence sorted", "The generator separates supplied facts, reasonable inferences, and open questions."],
  ["03", "Format chosen", "It selects an audit, map, report, comparison, or action plan based on the situation."],
  ["04", "URL out", "A hosted page comes back for Task 5 outreach and the Task 6 presentation."],
];

export default function HomePage() {
  return (
    <main>
      <section className="landing-hero">
        <nav className="landing-nav page-shell" aria-label="Primary navigation">
          <a className="wordmark" href="/">EnrichFlow<span>.</span></a>
          <a className="nav-pill" href="#generator">Try the contract</a>
        </nav>

        <div className="page-shell hero-grid">
          <div>
            <p className="kicker">Clay context → useful prospect asset</p>
            <h1>Build the right asset for the situation—not the same PDF every time.</h1>
            <p className="hero-copy">
              A prompt-first engine for turning your universe, signal, scoring logic, buyer, and prospect context into a polished decision aid.
            </p>
            <div className="hero-badges" aria-label="Supported formats">
              <span>Audit</span><span>Map</span><span>Report</span><span>Comparison</span><span>Action plan</span>
            </div>
          </div>

          <aside className="hero-note">
            <p className="mono-label">DESIGN RULE</p>
            <p className="serif-quote">“The asset should make the prospect smarter about their situation—even if they never buy.”</p>
            <div className="note-divider" />
            <p>Facts stay facts. Hypotheses stay hypotheses. LinkedIn URLs stay research seeds until a claim is independently supported.</p>
          </aside>
        </div>
      </section>

      <section className="page-shell process-section" aria-labelledby="process-title">
        <p className="kicker">The bones</p>
        <h2 id="process-title">One stable pipeline. Different meat for every prospect.</h2>
        <div className="principle-grid">
          {principles.map(([number, title, copy]) => (
            <article className="principle-card" key={number}>
              <span className="principle-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="generator-section" id="generator">
        <div className="page-shell generator-grid">
          <div>
            <p className="kicker">Local contract test</p>
            <h2>Paste what Clay knows.</h2>
            <p>This form calls the same endpoint an HTTP column will use. It is here to test the contract, not to replace the live Clay build.</p>
          </div>
          <DemoForm />
        </div>
      </section>
    </main>
  );
}
