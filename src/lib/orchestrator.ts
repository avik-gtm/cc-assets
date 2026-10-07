import { assetDocumentSchema, type AssetDocument, type AssetRequest } from "@/lib/schemas";
import { generateAsset } from "@/lib/generation/generator";
import { createAssetSlug } from "@/lib/slug";
import { saveAsset } from "@/lib/storage";

export type CreateAssetResult = {
  asset: AssetDocument;
  storage: "blob" | "memory";
};

export async function createPersonalizedAsset(
  input: AssetRequest,
  idempotencyKey?: string | null,
): Promise<CreateAssetResult> {
  const generation = await generateAsset(input);
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
  return { asset, storage };
}
