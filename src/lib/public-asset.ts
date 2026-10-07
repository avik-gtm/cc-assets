import { z } from "zod";
import {
  assetDocumentSchema,
  evidenceSchema,
  sectionSchema,
  type AssetDocument,
} from "@/lib/schemas";

function withoutClassification<T extends { classification?: string }>(item: T): Omit<T, "classification"> {
  const { classification, ...publicItem } = item;
  void classification;
  return publicItem;
}

// Public records have their own validation boundary: private evidence classes
// must not be required (or restored) when loading an already-redacted document.
// The original section schema still validates table row shapes before projection.
export const publicAssetSchema = assetDocumentSchema
  .omit({
    task5Hook: true,
    warnings: true,
    generationMode: true,
    companyLinkedInUrl: true,
    personLinkedInUrl: true,
    evidence: true,
    sections: true,
  })
  .extend({
    evidence: z.array(evidenceSchema.omit({ classification: true })).max(8),
    sections: z
      .array(
        sectionSchema.transform((section) => ({
          ...section,
          items: section.items.map(withoutClassification),
        })),
      )
      .min(2)
      .max(8),
  })
  .transform((asset) => ({
    ...asset,
    gift:
      asset.gift.status === "included" && asset.gift.claimUrl
        ? {
            status: "included" as const,
            title: asset.gift.title,
            message: asset.gift.message,
            claimUrl: asset.gift.claimUrl,
          }
        : { status: "omitted" as const },
  }));

export type PublicAsset = z.infer<typeof publicAssetSchema>;

// Keep operator handoff and research seeds off the page, download, and public JSON.
// Call this on the server before passing any props into client components.
export function toPublicAsset(asset: AssetDocument | PublicAsset): PublicAsset {
  return publicAssetSchema.parse(asset);
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
