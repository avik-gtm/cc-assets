"use client";
import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy text",
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <div className="copy-control">
      <button
        type="button"
        className="copy-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setStatus("Copied");
          } catch {
            setStatus("Copy unavailable. Select the text to copy it manually.");
          }
        }}
      >
        {label}
        <span aria-hidden="true"> ↗</span>
      </button>
      <span role="status" className="copy-status">
        {status}
      </span>
    </div>
  );
}

export function DownloadKit({ slug }: { slug: string }) {
  return (
    <a
      className="button"
      href={`/api/assets/${encodeURIComponent(slug)}/download`}
      download={`${slug}.md`}
    >
      Download document <span aria-hidden="true">↓</span>
    </a>
  );
}

export function PracticeChecklist({
  items,
  group,
}: {
  items: string[];
  group: string;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  return (
    <div className="practice-checklist">
      {items.map((item, index) => (
        <label key={item} className={checked.has(index) ? "checked" : ""}>
          <input
            type="checkbox"
            aria-label={`${group}: ${item}`}
            checked={checked.has(index)}
            onChange={() =>
              setChecked((previous) => {
                const next = new Set(previous);
                if (next.has(index)) next.delete(index);
                else next.add(index);
                return next;
              })
            }
          />
          <span>{item}</span>
        </label>
      ))}
      <span className="checklist-progress" aria-live="polite">
        {checked.size} / {items.length} checked · this visit only
      </span>
    </div>
  );
}
