"use client";

import { useEffect } from "react";

function openChapter(id: string) {
  const chapter = document.getElementById(id);
  if (chapter instanceof HTMLDetailsElement) chapter.open = true;
}

export function DocumentNavigation({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  useEffect(() => {
    const revealHash = () => {
      try {
        openChapter(decodeURIComponent(window.location.hash.slice(1)));
      } catch {
        // A malformed fragment must not break document navigation.
      }
    };
    let closedBeforePrint: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      closedBeforePrint = Array.from(
        document.querySelectorAll<HTMLDetailsElement>(
          ".asset-page details:not([open])",
        ),
      );
      closedBeforePrint.forEach((chapter) => {
        chapter.open = true;
      });
    };
    const afterPrint = () => {
      closedBeforePrint.forEach((chapter) => {
        chapter.open = false;
      });
      closedBeforePrint = [];
    };
    revealHash();
    window.addEventListener("hashchange", revealHash);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("hashchange", revealHash);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  const setAll = (open: boolean) => {
    document
      .querySelectorAll<HTMLDetailsElement>("details.chapter")
      .forEach((chapter) => {
        chapter.open = open;
      });
  };

  return (
    <nav className="document-navigation" aria-label="Document contents">
      <div className="contents-label">
        <p className="eyebrow">Inside this document</p>
        <div className="chapter-controls">
          <button type="button" onClick={() => setAll(true)}>
            Expand all
          </button>
          <button type="button" onClick={() => setAll(false)}>
            Collapse all
          </button>
        </div>
      </div>
      <ol>
        {sections.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`} onClick={() => openChapter(section.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title}
              <span aria-hidden="true" className="nav-arrow">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
