import type { AssetDocument, AssetRequest } from "@/lib/schemas";
import { linearSupportAsset } from "./linear-support";
import { lifecoreWellnessAsset } from "./lifecore-wellness";

const references: Record<NonNullable<AssetRequest["example"]>, AssetDocument> = {
  "linear-support": linearSupportAsset,
  "lifecore-wellness": lifecoreWellnessAsset,
};

export function getReferenceAsset(example: NonNullable<AssetRequest["example"]>) {
  return references[example];
}

export function getReferenceAssetBySlug(slug: string) {
  return Object.values(references).find((asset) => asset.slug === slug);
}
