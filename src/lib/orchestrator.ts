import {
  assetDocumentSchema,
  type AssetDocument,
  type AssetRequest,
} from "@/lib/schemas";
import { generateAsset } from "@/lib/generation/generator";
import { createAssetSlug } from "@/lib/slug";
import { saveAsset } from "@/lib/storage";
import { getReferenceAsset } from "@/lib/examples/references";

export type CreateAssetResult = {
  asset: AssetDocument;
  storage: "blob" | "memory" | "bundled";
  generation?: Awaited<ReturnType<typeof generateAsset>>["metadata"];
};

export async function createPersonalizedAsset(
  input: AssetRequest,
  idempotencyKey?: string | null,
): Promise<CreateAssetResult> {
  const generation = await generateAsset(input);
  if (generation.mode === "reference") {
    if (!input.example) throw new Error("A reference must be explicitly selected.");
    return { asset: getReferenceAsset(input.example), storage: "bundled" };
  }
  const slug = createAssetSlug(
    input,
    generation.asset.assetType,
    idempotencyKey,
    generation.asset.preparedFor,
  );
  const asset = assetDocumentSchema.parse({
    ...generation.asset,
    warnings: [...generation.asset.warnings, ...generation.warnings],
    slug,
    generatedAt: new Date().toISOString(),
    generationMode: generation.mode,
  });
  const storage = await saveAsset(asset);
  if (storage === "memory")
    asset.warnings.push(
      "Local preview storage only: this asset is not durable across process restarts.",
    );
  return { asset, storage, generation: generation.metadata };
}
