import type { AssetDocument } from "@/lib/schemas";

export type PublicAsset = Omit<
  AssetDocument,
  | "task5Hook"
  | "warnings"
  | "generationMode"
  | "companyLinkedInUrl"
  | "personLinkedInUrl"
  | "sections"
  | "evidence"
> & {
  sections: (Omit<AssetDocument["sections"][number], "items"> & {
    items: Omit<AssetDocument["sections"][number]["items"][number], "classification">[];
  })[];
  evidence: Omit<AssetDocument["evidence"][number], "classification">[];
};

function withoutClassification<T extends { classification?: string }>(item: T): Omit<T, "classification"> {
  const { classification, ...publicItem } = item;
  void classification;
  return publicItem;
}

// Keep operator handoff and research seeds off the page, download, and public JSON.
// Call this on the server before passing any props into client components.
export function toPublicAsset(asset: AssetDocument): PublicAsset {
  const {
    task5Hook,
    warnings,
    generationMode,
    companyLinkedInUrl,
    personLinkedInUrl,
    ...publicAsset
  } = asset;
  void task5Hook;
  void warnings;
  void generationMode;
  void companyLinkedInUrl;
  void personLinkedInUrl;
  return {
    ...publicAsset,
    sections: asset.sections.map((section) => ({
      ...section,
      items: section.items.map(withoutClassification),
    })),
    evidence: asset.evidence.map(withoutClassification),
    gift:
      asset.gift.status === "included" && asset.gift.claimUrl
        ? {
            status: "included",
            title: asset.gift.title,
            message: asset.gift.message,
            claimUrl: asset.gift.claimUrl,
          }
        : { status: "omitted" },
  };
}

export function assetToMarkdown(asset: PublicAsset): string {
  const lines = [
    `# ${asset.title}`,
    "",
    asset.subtitle,
    "",
    `Prepared for ${asset.preparedFor}`,
    "",
    asset.useNote || "",
  ];
  for (const section of asset.sections) {
    lines.push("", `## ${section.title}`, "", section.summary || "");
    for (const item of section.items) {
      lines.push(
        "",
        `### ${item.title}`,
        "",
        item.usage || "",
        item.value || "",
        item.description,
      );
      if (item.procedure)
        lines.push(
          ...item.procedure.map((step) => `${step.label}: ${step.instruction}`),
        );
      if (item.cells)
        item.cells.forEach((cell, index) =>
          lines.push(`${section.columns?.[index] || "Detail"}: ${cell}`),
        );
      if (item.checks)
        lines.push(...item.checks.map((check) => `- [ ] ${check}`));
      if (item.sourceUrl) lines.push(`Source: ${item.sourceUrl}`);
    }
  }
  if (asset.documentFormat !== "six_part_brief")
    lines.push(
      "",
      "## Implementation notes",
      "",
      asset.nonObviousInsight,
      "",
      ...asset.recommendedActions.map((action) => `- ${action}`),
    );
  if (asset.callToAction) {
    lines.push("", "## See how it would work", "", asset.callToAction.message);
    if (asset.callToAction.url)
      lines.push(`Walkthrough: ${asset.callToAction.url}`);
    if (asset.approvedGiftOffer)
      lines.push(
        `If your company policy allows, happy to send over ${asset.approvedGiftOffer.label}. ${asset.approvedGiftOffer.policyNote || ""}`,
      );
  }
  if (asset.evidence.length)
    lines.push(
      "",
      "### Background for these recommendations",
      "",
      ...asset.evidence.map(
        (item) =>
          `- ${item.label}: ${item.value}. ${item.detail}${item.sourceUrl ? ` Source: ${item.sourceUrl}` : ""}`,
      ),
    );
  if (asset.sources.length)
    lines.push(
      "",
      "### Reference links",
      "",
      ...asset.sources.map(
        (source) =>
          `- ${source.label}: ${source.url}${source.checkedAt ? ` (checked ${source.checkedAt})` : ""}${source.note ? ` — ${source.note}` : ""}`,
      ),
    );
  lines.push(
    "",
    asset.preparedBy ? `Prepared by ${asset.preparedBy}.` : "",
    "Independent working draft; not an official company policy or endorsement.",
  );
  return lines
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");
}
