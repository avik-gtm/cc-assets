import { generatedAssetSchema, type AssetRequest, type GeneratedAsset } from "../schemas";

/** Shared by the hosted forwarder and the separately running writer. */
export function validateGeneratedAsset(value: unknown, input: AssetRequest): GeneratedAsset {
  const asset = generatedAssetSchema.parse(value);
  const supplied = JSON.stringify(input);
  const references = [
    ...asset.sources.map((source) => source.url),
    ...asset.evidence.map((item) => item.sourceUrl),
    ...asset.sections.flatMap((section) => section.items.map((item) => item.sourceUrl)),
    asset.logoUrl,
    asset.gift.sourceUrl,
    asset.gift.claimUrl,
    asset.callToAction?.url,
  ].filter((url): url is string => Boolean(url));
  if (references.some((url) => !supplied.includes(url))) {
    throw new Error("Generator returned an unsupplied reference URL.");
  }
  if (
    asset.documentFormat !== "six_part_brief" ||
    asset.sections.map((section) => section.id).join(",") !==
      "current-situation,likely-problem,solution,alternatives" ||
    !asset.callToAction
  ) {
    throw new Error("Generator did not return the requested six-part structure.");
  }
  // Only the caller can approve an offer. This does not purchase or issue a gift.
  return { ...asset, approvedGiftOffer: input.approvedGiftOffer };
}
