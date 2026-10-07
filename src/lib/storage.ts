import { list, put } from "@vercel/blob";
import type { AssetDocument } from "@/lib/schemas";
import { getReferenceAssetBySlug } from "@/lib/examples/references";
import { publicAssetSchema, toPublicAsset, type PublicAsset } from "@/lib/public-asset";

type GlobalWithAssetStore = typeof globalThis & {
  __enrichflowAssetStore?: Map<string, PublicAsset>;
};

function memoryStore(): Map<string, PublicAsset> {
  const globalObject = globalThis as GlobalWithAssetStore;
  if (!globalObject.__enrichflowAssetStore) {
    globalObject.__enrichflowAssetStore = new Map<string, PublicAsset>();
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
  const publicRecord = toPublicAsset(asset);
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

export async function getAsset(slug: string): Promise<AssetDocument | PublicAsset | null> {
  const reference = getReferenceAssetBySlug(slug);
  if (reference) return reference;
  const memoryAsset = memoryStore().get(slug);
  if (memoryAsset) return memoryAsset;

  if (!durableStorageEnabled()) return null;

  const pathname = `assets/${slug}.json`;
  const result = await list({ prefix: pathname, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === pathname);
  if (!blob) return null;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  // Also accepts older records: the public schema strips legacy private fields.
  return publicAssetSchema.parse(await response.json());
}
