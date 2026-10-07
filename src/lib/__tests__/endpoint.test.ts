import { afterEach, describe, expect, it, vi } from "vitest";
import { ENDPOINT_TTL_MS, signEndpointRecord, verifyEndpointRecord } from "../generation/endpoint-record";
import { resolveGeneratorEndpoint } from "../generation/endpoint";
import { get } from "@vercel/blob";
vi.mock("@vercel/blob", () => ({ get: vi.fn() }));
const key = "test-only-signing-key-with-32-characters";
const endpoint = "https://example-worker-test.trycloudflare.com/generate";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("signed generator discovery", () => {
  it("round trips without exposing the signing key", () => {
    const record = signEndpointRecord(endpoint, key, 100_000);
    expect(verifyEndpointRecord(record, key, 100_001)).toBe(endpoint);
    expect(JSON.stringify(record)).not.toContain(key);
  });
  it("rejects tampering, wrong keys, expiry and future records", () => {
    const record = signEndpointRecord(endpoint, key, 100_000);
    expect(() => verifyEndpointRecord({ ...record, endpoint: endpoint.replace("example", "attacker") }, key, 100_001)).toThrow();
    expect(() => verifyEndpointRecord(record, key + "wrong", 100_001)).toThrow();
    expect(() => verifyEndpointRecord(record, key, 100_000 + ENDPOINT_TTL_MS)).toThrow();
    expect(() => verifyEndpointRecord(record, key, 1)).toThrow();
    expect(() => verifyEndpointRecord({ ...record, signature: "invalid" }, key, 100_001)).toThrow();
  });
  it.each([
    "http://example.trycloudflare.com/generate", "https://127.0.0.1/generate",
    "https://example.trycloudflare.com.evil.test/generate", "https://evil.test/generate",
    "https://user:password@example.trycloudflare.com/generate", "https://example.trycloudflare.com:8443/generate",
    "https://example.trycloudflare.com/generate?next=evil", "https://example.trycloudflare.com/generate#secret",
  ])("rejects unapproved destinations %s", url => { expect(() => signEndpointRecord(url, key)).toThrow(); });
  it("bypasses stale caches and resolves a signed record", async () => {
    vi.stubEnv("ASSET_GENERATOR_DISCOVERY", "blob"); vi.stubEnv("ASSET_GENERATOR_TOKEN", key);
    vi.mocked(get).mockResolvedValue({ statusCode: 200, stream: new Response(JSON.stringify(signEndpointRecord(endpoint, key))).body! } as never);
    expect(await resolveGeneratorEndpoint()).toBe(endpoint);
    expect(get).toHaveBeenCalledWith("runtime/generator-endpoint.json", expect.objectContaining({ useCache: false, access: "public" }));
  });
  it("does not fall back to a stale URL if discovery is unavailable", async () => {
    vi.stubEnv("ASSET_GENERATOR_DISCOVERY", "blob"); vi.stubEnv("ASSET_GENERATOR_URL", "https://stale.trycloudflare.com/generate");
    vi.mocked(get).mockResolvedValue(null);
    await expect(resolveGeneratorEndpoint()).rejects.toThrow();
  });
  it("rejects oversized records", async () => {
    vi.stubEnv("ASSET_GENERATOR_DISCOVERY", "blob");
    vi.mocked(get).mockResolvedValue({ statusCode: 200, stream: new Response("x".repeat(4097)).body! } as never);
    await expect(resolveGeneratorEndpoint()).rejects.toThrow("Oversized");
  });
  it("preserves explicit endpoint mode", async () => {
    vi.stubEnv("ASSET_GENERATOR_DISCOVERY", ""); vi.stubEnv("ASSET_GENERATOR_URL", "https://approved.test/generate");
    expect(await resolveGeneratorEndpoint()).toBe("https://approved.test/generate");
    expect(get).not.toHaveBeenCalled();
  });
});
