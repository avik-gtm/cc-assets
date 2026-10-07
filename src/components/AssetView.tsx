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
  if (section.layout === "replies")
    return (
      <div className="reply-list">
        {section.items.map((item, index) => (
          <details className="reply-card" key={item.title} open={index === 0}>
            <summary>
              <span className="reply-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="eyebrow small">Ready to adapt</span>
                <h3>{item.title}</h3>
              </div>
              <span className="expand-icon" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="reply-content">
              {item.usage ? <p className="usage-note">{item.usage}</p> : null}
              <div className="message-window">
                <div className="message-bar">
                  <span className="window-dots" aria-hidden="true">
                    ● ● ●
                  </span>
                  <span>Response draft</span>
                </div>
                {item.value ? (
                  <div className="message-subject">
                    <span>Subject</span>
                    {item.value}
                  </div>
                ) : null}
                <div className="message-body">{item.description}</div>
                <div className="message-actions">
                  <CopyButton
                    text={`${item.value ? `Subject: ${item.value}\n\n` : ""}${item.description}`}
                  />
                  {item.sourceUrl ? (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                      Read source ↗
                    </a>
                  ) : null}
                </div>
              </div>
              {item.checks?.length ? (
                <details className="agent-checks">
                  <summary>
                    Before sending: {item.checks.length} checks{" "}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <ul>
                    {item.checks.map((check) => (
                      <li key={check}>{check}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    );
  return (
    <div className={`module-grid ${section.layout}`}>
      {section.items.map((item, index) => (
        <article className="module-card" key={item.title}>
          <span className="eyebrow small">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.checks ? (
            <PracticeChecklist items={item.checks} group={item.title} />
          ) : null}
          {item.sourceUrl ? (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              Source ↗
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function AssetView({ asset }: { asset: PublicAsset }) {
  const replies = asset.sections.find(
    (section) => section.layout === "replies",
  );
  const checklist = asset.sections.find(
    (section) => section.layout === "checklist",
  );
  const style = {
    "--accent": asset.brandColor,
    "--hero-bg": asset.brandBackground || "#171713",
    "--brand-surface": asset.brandSurface || "#f4f1e9",
  } as CSSProperties;
  return (
    <main className="asset-page" style={style}>
      <a className="skip-link" href="#asset-content">
        Skip to the kit
      </a>
      <nav className="asset-nav" aria-label="Asset navigation">
        <div className="nav-inner">
          <div className="recipient-brand">
            <span className="eyebrow small">Prepared for</span>
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
          </div>
          <div className="nav-links">
            {asset.sections.slice(0, 3).map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.layout === "replies"
                  ? "The drafts"
                  : section.layout === "table"
                    ? "Escalations"
                    : section.layout === "checklist"
                      ? "First week"
                      : section.eyebrow || "Details"}
              </a>
            ))}
            <a href="#sources">Sources</a>
          </div>
          <a className="nav-download" href="#take-the-kit">
            Take the kit <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>
      <header className="asset-hero">
        <div className="page-shell hero-grid">
          <div className="hero-main">
            <p className="eyebrow hero-eyebrow">
              <span className="accent-dot" />
              {asset.documentLabel || "Prepared for your team"}
            </p>
            <h1>{asset.title}</h1>
            <p className="asset-subtitle">{asset.subtitle}</p>
            <a className="hero-button" href={`#${asset.sections[0].id}`}>
              Open the kit <span aria-hidden="true">↓</span>
            </a>
            <p className="hero-credit">
              {asset.preparedBy || "Independently prepared"}
              <span> • </span>For {asset.recipientTitle || asset.preparedFor}
            </p>
          </div>
          <aside className="kit-cover" aria-label="Kit contents">
            <div className="cover-topline">
              <span>Working edition / 01</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="cover-company">{asset.preparedFor}</div>
            <h2>
              Less blank page.
              <br />
              More useful work.
            </h2>
            <div className="cover-list">
              <div>
                <span>
                  {String(
                    replies?.items.length || asset.sections.length,
                  ).padStart(2, "0")}
                </span>
                <p>
                  {replies ? "Product-specific drafts" : "Practical modules"}
                </p>
              </div>
              <div>
                <span>01</span>
                <p>Clear handoff template</p>
              </div>
              <div>
                <span>
                  {String(
                    checklist?.items.length || asset.sources.length,
                  ).padStart(2, "0")}
                </span>
                <p>
                  {checklist ? "Days of guided practice" : "Supporting sources"}
                </p>
              </div>
            </div>
            <div className="cover-footer">
              <span className="mini-line" />A starting point. Yours to adapt.
            </div>
          </aside>
        </div>
      </header>
      <div className="page-shell" id="asset-content">
        <div className="editorial-intro">
          <span className="eyebrow">Made for the work</span>
          <p>{asset.executiveSummary}</p>
        </div>
        {asset.sections.map((section, index) => (
          <details
            className="chapter"
            key={section.id}
            id={section.id}
            open={section.defaultOpen ?? index === 0}
          >
            <summary>
              <span className="chapter-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="eyebrow small">
                  {section.eyebrow || "In the kit"}
                </span>
                <h2>{section.title}</h2>
                <p>{section.summary}</p>
              </div>
              <span className="expand-icon" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="chapter-content">
              <SectionContents section={section} />
            </div>
          </details>
        ))}
        <section className="take-kit" id="take-the-kit">
          <div>
            <p className="eyebrow">Keep the useful part</p>
            <h2>Make it your team’s.</h2>
            <p>
              Download an editable Markdown copy. Review it together, adapt the
              details, and keep the sources attached.
            </p>
            <DownloadKit slug={asset.slug} />
          </div>
          <ol>
            {asset.recommendedActions.map((action, index) => (
              <li key={action}>
                <span>0{index + 1}</span>
                {action}
              </li>
            ))}
          </ol>
        </section>
        <details className="chapter source-chapter" id="sources">
          <summary>
            <span className="chapter-number">↳</span>
            <div>
              <span className="eyebrow small">The work behind the work</span>
              <h2>Sources, scope, and assumptions.</h2>
              <p>
                Check the product guidance. Separate it from our proposed
                operating process.
              </p>
            </div>
            <span className="expand-icon" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="chapter-content">
            <p className="scope-note">
              {asset.useNote ||
                "Review this working draft against current product guidance and your internal policies before use."}
            </p>
            <div className="source-list">
              {asset.sources.map((source, index) => (
                <article key={source.url}>
                  <span className="eyebrow small">0{index + 1}</span>
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
              ))}
            </div>
            <div className="editor-note">
              <span className="eyebrow small">A useful distinction</span>
              <p>{asset.nonObviousInsight}</p>
            </div>
          </div>
        </details>
        {asset.gift.status === "included" && asset.gift.claimUrl ? (
          <section className="gift-section">
            <p className="eyebrow">A small thank you</p>
            <h2>{asset.gift.title}</h2>
            <p>{asset.gift.message}</p>
            <a
              className="button"
              href={asset.gift.claimUrl}
              target="_blank"
              rel="noreferrer"
            >
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
    </main>
  );
}
