import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const ENDPOINT_RECORD_PATH = "runtime/generator-endpoint.json";
export const ENDPOINT_TTL_MS = 10 * 60_000;
const recordSchema = z.object({
  version: z.literal(1), endpoint: z.string().max(300),
  issuedAt: z.number().int(), expiresAt: z.number().int(),
  signature: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
type EndpointRecord = z.infer<typeof recordSchema>;
function signature(record: Omit<EndpointRecord, "signature">, key: string) {
  if (key.length < 24) throw new Error("Missing endpoint signing key.");
  return createHmac("sha256", key).update(JSON.stringify([
    "asset-endpoint-v1", record.endpoint, record.issuedAt, record.expiresAt,
  ])).digest("hex");
}
function checkEndpoint(endpoint: string) {
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.trycloudflare\.com$/.test(url.hostname)
    || url.port || url.username || url.password || url.search || url.hash || url.pathname !== "/generate"
    || url.href !== endpoint) throw new Error("Invalid tunnel endpoint.");
}
export function signEndpointRecord(endpoint: string, key: string, now = Date.now()): EndpointRecord {
  checkEndpoint(endpoint);
  const record = { version: 1 as const, endpoint, issuedAt: now, expiresAt: now + ENDPOINT_TTL_MS };
  return { ...record, signature: signature(record, key) };
}
export function verifyEndpointRecord(value: unknown, key: string, now = Date.now()): string {
  const record = recordSchema.parse(value);
  checkEndpoint(record.endpoint);
  if (record.issuedAt > now + 30_000 || record.expiresAt <= now || record.issuedAt > record.expiresAt
    || record.expiresAt - record.issuedAt !== ENDPOINT_TTL_MS) throw new Error("Expired endpoint record.");
  const expected = Buffer.from(signature(record, key), "hex");
  if (!timingSafeEqual(expected, Buffer.from(record.signature, "hex"))) throw new Error("Invalid endpoint signature.");
  return record.endpoint;
}
