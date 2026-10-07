import { list, put } from "@vercel/blob";
import { assetDocumentSchema, type AssetDocument } from "@/lib/schemas";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { toPublicAsset } from "@/lib/public-asset";

type GlobalWithAssetStore = typeof globalThis & {
  __enrichflowAssetStore?: Map<string, AssetDocument>;
};

function memoryStore(): Map<string, AssetDocument> {
  const globalObject = globalThis as GlobalWithAssetStore;
  if (!globalObject.__enrichflowAssetStore) {
    globalObject.__enrichflowAssetStore = new Map<string, AssetDocument>();
  }
  return globalObject.__enrichflowAssetStore;
}

export function durableStorageEnabled(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

export async function saveAsset(
  asset: AssetDocument,
): Promise<"blob" | "memory"> {
  // Blob objects are public. Never persist the operator-only hook or research
  // seeds there, even though the application also projects its public responses.
  const publicRecord = assetDocumentSchema.parse({
    ...toPublicAsset(asset),
    generationMode: asset.generationMode,
    task5Hook: "Withheld from public storage.",
    warnings: [],
  });
  if (!durableStorageEnabled()) {
    if (process.env.VERCEL)
      throw new Error(
        "Durable asset storage is not configured. No temporary production URL was published.",
      );
    memoryStore().set(asset.slug, publicRecord);
    return "memory";
  }

  await put(`assets/${asset.slug}.json`, JSON.stringify(publicRecord), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  return "blob";
}

export async function getAsset(slug: string): Promise<AssetDocument | null> {
  if (slug === linearSupportAsset.slug) return linearSupportAsset;
  const memoryAsset = memoryStore().get(slug);
  if (memoryAsset) return memoryAsset;

  if (!durableStorageEnabled()) return null;

  const pathname = `assets/${slug}.json`;
  const result = await list({ prefix: pathname, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === pathname);
  if (!blob) return null;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  return assetDocumentSchema.parse(await response.json());
}
