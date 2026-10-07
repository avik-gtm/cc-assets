import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { publicAssetSchema, toPublicAsset } from "@/lib/public-asset";
import type { AssetDocument } from "@/lib/schemas";
import { getAsset, saveAsset } from "@/lib/storage";
import { GET } from "@/app/api/assets/[slug]/route";
import { GET as download } from "@/app/api/assets/[slug]/download/route";

const blob = vi.hoisted(() => ({ put: vi.fn(), list: vi.fn() }));
vi.mock("@vercel/blob", () => blob);

function document(slug: string): AssetDocument {
  return {
    ...linearSupportAsset,
    slug,
    generationMode: "agent",
    task5Hook: "PRIVATE_PITCH",
    warnings: ["PRIVATE_WARNING"],
    companyLinkedInUrl: "https://linkedin.com/company/private-seed",
    personLinkedInUrl: "https://linkedin.com/in/private-person",
    evidence: [
      {
        label: "Distributed support",
        value: "A proposed operating consideration",
        detail: "Multiple locations may complicate coverage; workload is not established.",
        classification: "inference",
        sourceUrl: "https://example.com/locations",
      },
    ],
  };
}

beforeEach(() => {
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  vi.stubEnv("BLOB_STORE_ID", "");
  blob.put.mockReset();
  blob.list.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const privateFields = /PRIVATE_|private-seed|private-person|task5Hook|warnings|generationMode|classification/;

describe("public asset storage", () => {
  it("round-trips nonempty evidence in memory without inventing or leaking classifications", async () => {
    const asset = document("storage-memory-evidence");
    expect(await saveAsset(asset)).toBe("memory");
    const stored = await getAsset(asset.slug);
    expect(stored).toEqual(toPublicAsset(asset));
    expect(stored?.evidence).toHaveLength(1);
    expect(stored?.evidence[0].detail).toContain("workload is not established");
    expect(JSON.stringify(stored)).not.toMatch(privateFields);
    expect(publicAssetSchema.safeParse(stored).success).toBe(true);
    expect(toPublicAsset(toPublicAsset(asset))).toEqual(toPublicAsset(asset));
    expect(asset.evidence[0].classification).toBe("inference");
  });

  it("stores and reads only the public schema through Blob", async () => {
    vi.stubEnv("BLOB_STORE_ID", "test-store");
    const asset = document("storage-blob-evidence");
    blob.put.mockResolvedValue({});
    expect(await saveAsset(asset)).toBe("blob");
    const [pathname, body, options] = blob.put.mock.calls[0];
    expect(pathname).toBe(`assets/${asset.slug}.json`);
    expect(options.access).toBe("public");
    expect(body).not.toMatch(privateFields);
    expect(JSON.parse(body).evidence).toHaveLength(1);
    blob.list.mockResolvedValue({ blobs: [{ pathname, url: "https://test.public.blob.vercel-storage.com/asset.json" }] });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
    expect(await getAsset(asset.slug)).toEqual(toPublicAsset(asset));
  });

  it("redacts legacy Blob records that still contain private metadata", async () => {
    vi.stubEnv("BLOB_STORE_ID", "test-store");
    const asset = document("storage-legacy-evidence");
    blob.list.mockResolvedValue({ blobs: [{ pathname: `assets/${asset.slug}.json`, url: "https://test.public.blob.vercel-storage.com/legacy.json" }] });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(asset))));
    const stored = await getAsset(asset.slug);
    expect(JSON.stringify(stored)).not.toMatch(privateFields);
    expect(stored?.evidence[0].detail).toBe(asset.evidence[0].detail);
  });

  it("serves nonempty evidence in public JSON and Markdown without private labels", async () => {
    const asset = document("storage-public-routes");
    await saveAsset(asset);
    const params = Promise.resolve({ slug: asset.slug });
    const response = await GET(new NextRequest(`https://example.com/api/assets/${asset.slug}`), { params });
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.asset.evidence).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(privateFields);
    const markdown = await download(new Request("https://example.com/download"), { params });
    expect(markdown.status).toBe(200);
    const text = await markdown.text();
    expect(text).toContain(asset.evidence[0].detail);
    expect(text).not.toMatch(privateFields);
  });

  it("retains structural validation for public section table rows", () => {
    const asset = toPublicAsset(document("storage-invalid-table"));
    const table = asset.sections.find((section) => section.columns);
    expect(table).toBeDefined();
    table!.items[0].cells = [];
    expect(publicAssetSchema.safeParse(asset).success).toBe(false);
  });
});
