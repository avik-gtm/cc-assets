import { get } from "@vercel/blob";
import { ENDPOINT_RECORD_PATH, verifyEndpointRecord } from "./endpoint-record";

export function generatorConfigured() {
  return Boolean(process.env.ASSET_GENERATOR_URL || process.env.ASSET_GENERATOR_DISCOVERY === "blob");
}
export async function resolveGeneratorEndpoint(): Promise<string> {
  if (process.env.ASSET_GENERATOR_DISCOVERY !== "blob") {
    if (!process.env.ASSET_GENERATOR_URL) throw new Error("Generator not configured.");
    return process.env.ASSET_GENERATOR_URL;
  }
  // Never fall back to an old tunnel if discovery fails. Public records are signed;
  // the shared authentication key itself is never uploaded to Blob.
  const result = await get(ENDPOINT_RECORD_PATH, {
    access: "public", useCache: false, abortSignal: AbortSignal.timeout(5_000),
  });
  if (!result || result.statusCode !== 200) throw new Error("Generator registration unavailable.");
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) throw new Error("Oversized generator registration.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  return verifyEndpointRecord(JSON.parse(Buffer.concat(chunks).toString("utf8")), process.env.ASSET_GENERATOR_TOKEN || "");
}
