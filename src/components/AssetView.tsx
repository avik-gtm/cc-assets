import type { AssetDocument, AssetSection } from "@/lib/schemas";

function ClassBadge({ value }: { value?: "fact" | "inference" | "unknown" }) {
  return value ? <span className={`class-badge ${value}`}>{value}</span> : null;
}

function AssetSectionView({ section }: { section: AssetSection }) {
  return (
    <section className="asset-section" id={section.id}>
      <header className="section-header">
        {section.eyebrow ? <p className="kicker">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>
        {section.summary ? <p>{section.summary}</p> : null}
      </header>
      <div className={`section-items layout-${section.layout}`}>
        {section.items.map((item, index) => (
          <article className="section-item" key={`${section.id}-${index}`}>
            <div className="item-topline">
              {item.value ? <span className="item-value">{item.value}</span> : null}
              <ClassBadge value={item.classification} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.badge ? <span className="subtle-badge">{item.badge}</span> : null}
            {item.sourceUrl ? <a href={item.sourceUrl} rel="noreferrer" target="_blank">View source ↗</a> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function AssetView({ asset }: { asset: AssetDocument }) {
  return (
    <main className="asset-page" style={{ "--asset-accent": asset.brandColor } as React.CSSProperties}>
      <header className="asset-hero">
        <nav className="asset-nav page-shell">
          <a className="wordmark light" href="/">EnrichFlow<span>.</span></a>
          <span>{asset.assetType.replace("_", " ")}</span>
        </nav>
        <div className="page-shell asset-hero-content">
          <div>
            <p className="kicker light-kicker">Prepared for {asset.preparedFor}</p>
            <h1>{asset.title}</h1>
            <p className="asset-subtitle">{asset.subtitle}</p>
          </div>
          <div className="recipient-card">
            <p className="mono-label">PREPARED AROUND</p>
            <strong>{asset.recipientName || asset.recipientTitle || "The relevant owner"}</strong>
            {asset.recipientName && asset.recipientTitle ? <span>{asset.recipientTitle}</span> : null}
            <span>{new Date(asset.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </header>

      <div className="page-shell asset-body">
        <section className="executive-block">
          <div>
            <p className="kicker">Executive readout</p>
            <p className="executive-copy">{asset.executiveSummary}</p>
          </div>
          <aside className="insight-card">
            <span className="insight-mark">↗</span>
            <p className="mono-label">NON-OBVIOUS INSIGHT</p>
            <p>{asset.nonObviousInsight}</p>
          </aside>
        </section>

        <section className="evidence-strip" aria-labelledby="evidence-title">
          <div className="section-header">
            <p className="kicker">Evidence ledger</p>
            <h2 id="evidence-title">What we know—and what we do not.</h2>
          </div>
          <div className="evidence-grid">
            {asset.evidence.map((item, index) => (
              <article key={`${item.label}-${index}`}>
                <div className="item-topline"><span>{item.value}</span><ClassBadge value={item.classification} /></div>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
                {item.sourceUrl ? <a href={item.sourceUrl} rel="noreferrer" target="_blank">Evidence ↗</a> : null}
              </article>
            ))}
          </div>
        </section>

        {asset.sections.map((section) => <AssetSectionView key={section.id} section={section} />)}

        <section className="action-section">
          <div>
            <p className="kicker light-kicker">Recommended next moves</p>
            <h2>Turn the signal into a useful decision.</h2>
          </div>
          <ol>
            {asset.recommendedActions.map((action, index) => (
              <li key={action}><span>{String(index + 1).padStart(2, "0")}</span>{action}</li>
            ))}
          </ol>
        </section>

        {asset.gift.status !== "omitted" ? (
          <section className="gift-section">
            <p className="kicker">A thoughtful extra</p>
            <h2>{asset.gift.title}</h2>
            <p>{asset.gift.message}</p>
            {asset.gift.sourceUrl ? <a href={asset.gift.sourceUrl} rel="noreferrer" target="_blank">Why this was selected ↗</a> : null}
            {asset.gift.claimUrl ? <a className="button" href={asset.gift.claimUrl} rel="noreferrer" target="_blank">Claim gift</a> : null}
          </section>
        ) : null}

        <section className="sources-section">
          <div>
            <p className="kicker">Sources and handoff</p>
            <h2>Built to support the conversation.</h2>
            <p className="task-five-hook">{asset.task5Hook}</p>
          </div>
          <div>
            {asset.sources.length ? (
              <ol>{asset.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label} ↗</a></li>)}</ol>
            ) : <p>No external source URLs were supplied.</p>}
          </div>
        </section>

        <footer className="asset-footer">
          <span>Prepared with EnrichFlow</span>
          <span>Facts, inferences, and unknowns are intentionally separated.</span>
        </footer>
      </div>
    </main>
  );
}
