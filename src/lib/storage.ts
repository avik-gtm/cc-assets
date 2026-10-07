import { list, put } from "@vercel/blob";
import { assetDocumentSchema, type AssetDocument } from "@/lib/schemas";

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
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function saveAsset(asset: AssetDocument): Promise<"blob" | "memory"> {
  if (!durableStorageEnabled()) {
    memoryStore().set(asset.slug, asset);
    return "memory";
  }

  await put(`assets/${asset.slug}.json`, JSON.stringify(asset), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  return "blob";
}

export async function getAsset(slug: string): Promise<AssetDocument | null> {
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
