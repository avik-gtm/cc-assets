import type { CSSProperties } from "react";
import Image from "next/image";
import type { AssetSection } from "@/lib/schemas";
import type { PublicAsset } from "@/lib/public-asset";
import { CopyButton, DownloadKit, PracticeChecklist } from "./AssetActions";

function SectionContents({ section }: { section: AssetSection }) {
  if (section.layout === "table" && section.columns)
    return (
      <div
        className="table-scroll"
        role="region"
        aria-label={section.title}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              {section.columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.title}>
                {(item.cells || [item.title, item.description]).map(
                  (cell, index) =>
                    index === 0 ? (
                      <th scope="row" key={index}>
                        {cell}
                      </th>
                    ) : (
                      <td key={index}>{cell}</td>
                    ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  // Legacy "replies" records remain readable, but never get an email composer shell.
  const isTemplate =
    section.layout === "narrative" || section.layout === "replies";
  return (
    <div className={`module-grid ${isTemplate ? "templates" : section.layout}`}>
      {section.items.map((item, index) => (
        <article className="module-card" key={item.title}>
          <div className="module-heading">
            <span className="item-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{item.title}</h3>
            {item.classification ? (
              <span className="evidence-label">{item.classification}</span>
            ) : null}
          </div>
          {item.usage ? <p className="usage-note">{item.usage}</p> : null}
          {item.value ? <p className="item-value">{item.value}</p> : null}
          <p className={isTemplate ? "template-text" : "item-description"}>
            {item.description}
          </p>
          {item.checks?.length ? (
            <PracticeChecklist items={item.checks} group={item.title} />
          ) : null}
          {isTemplate || item.sourceUrl ? (
            <div className="module-actions">
              {isTemplate ? (
                <CopyButton
                  text={[item.value, item.description]
                    .filter(Boolean)
                    .join("\n\n")}
                  label="Copy template"
                />
              ) : null}
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function AssetView({ asset }: { asset: PublicAsset }) {
  const style = {
    "--accent": asset.brandColor,
    "--brand-ink": asset.brandBackground || "#222326",
    "--brand-surface": asset.brandSurface || "#f4f5f8",
  } as CSSProperties;
  return (
    <main className="asset-page" style={style}>
      <a className="skip-link" href="#asset-content">
        Skip to document
      </a>
      <div className="document-toolbar">
        <div className="page-shell toolbar-inner">
          <div className="recipient-brand">
            {asset.logoUrl ? (
              <Image
                src={asset.logoUrl}
                alt={asset.preparedFor}
                width={112}
                height={30}
                unoptimized
              />
            ) : (
              <strong>{asset.preparedFor}</strong>
            )}
            <span>Independent working document</span>
          </div>
          <DownloadKit slug={asset.slug} />
        </div>
      </div>
      <div className="page-shell document-layout">
        <aside className="document-sidebar">
          <nav aria-label="Document contents">
            <p className="eyebrow">Contents</p>
            <ol>
              {asset.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.navigationLabel || section.title}
                  </a>
                </li>
              ))}
            </ol>
            <a className="supporting-link" href="#implementation">
              Implementation notes
            </a>
            <a className="supporting-link" href="#sources">
              Sources & assumptions
            </a>
          </nav>
          <p className="sidebar-credit">
            {asset.preparedBy || "Independently prepared"}
          </p>
        </aside>
        <div className="document-body" id="asset-content">
          <header className="document-header">
            <p className="eyebrow">
              {asset.documentLabel || asset.assetType.replaceAll("_", " ")}
            </p>
            <h1>{asset.title}</h1>
            <p className="document-subtitle">{asset.subtitle}</p>
            <dl className="document-meta">
              <div>
                <dt>Company</dt>
                <dd>{asset.preparedFor}</dd>
              </div>
              {asset.recipientTitle ? (
                <div>
                  <dt>Working audience</dt>
                  <dd>{asset.recipientTitle}</dd>
                </div>
              ) : null}
            </dl>
            <div className="scope-note">
              <strong>Scope</strong>
              <p>
                {asset.useNote ||
                  "A proposed working document. Validate assumptions against current evidence and internal policies before use."}
              </p>
            </div>
            <p className="document-summary">{asset.executiveSummary}</p>
          </header>

          {asset.sections.map((section, index) => (
            <section
              className="chapter"
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
            >
              <header className="chapter-heading">
                <span className="chapter-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.summary ? <p>{section.summary}</p> : null}
                </div>
              </header>
              <SectionContents section={section} />
            </section>
          ))}

          <section className="implementation-notes" id="implementation">
            <h2>Implementation notes</h2>
            <ol>
              {asset.recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </section>
          <details className="source-chapter" id="sources" open>
            <summary>
              <h2>Sources & assumptions</h2>
              <span aria-hidden="true">±</span>
            </summary>
            {asset.evidence.length ? (
              <div className="evidence-list">
                {asset.evidence.map((item) => (
                  <article key={item.label}>
                    <span className="evidence-label">
                      {item.classification}
                    </span>
                    <h3>
                      {item.label}: {item.value}
                    </h3>
                    <p>{item.detail}</p>
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                        Source ↗
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
            <div className="source-list">
              {asset.sources.length ? (
                asset.sources.map((source) => (
                  <article key={source.url}>
                    <div>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.label} ↗
                      </a>
                      <p>{source.note}</p>
                    </div>
                    {source.checkedAt ? (
                      <time dateTime={source.checkedAt}>
                        Checked {source.checkedAt}
                      </time>
                    ) : null}
                  </article>
                ))
              ) : (
                <p>
                  No verified source material supplied. This is a proposed plan,
                  not a completed investigation.
                </p>
              )}
            </div>
            <p className="editor-note">{asset.nonObviousInsight}</p>
          </details>
          {asset.gift.status === "included" && asset.gift.claimUrl ? (
            <section className="gift-section">
              <h2>{asset.gift.title}</h2>
              <p>{asset.gift.message}</p>
              <a href={asset.gift.claimUrl} target="_blank" rel="noreferrer">
                View gift ↗
              </a>
            </section>
          ) : null}
          <footer className="asset-footer">
            <span>{asset.preparedBy || "Independently prepared"}</span>
            <span>
              Not an official {asset.preparedFor} publication or endorsement.
            </span>
          </footer>
        </div>
      </div>
    </main>
  );
}
