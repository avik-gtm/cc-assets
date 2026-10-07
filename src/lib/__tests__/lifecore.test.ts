import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { lifecoreWellnessAsset } from "@/lib/examples/lifecore-wellness";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { assetDocumentSchema, assetRequestSchema } from "@/lib/schemas";
import { assetToMarkdown, toPublicAsset } from "@/lib/public-asset";
import { createPersonalizedAsset } from "@/lib/orchestrator";
import { getAsset } from "@/lib/storage";
import { AssetView } from "@/components/AssetView";
import { POST } from "@/app/api/assets/route";
import { GET } from "@/app/api/assets/[slug]/route";
import { GET as download } from "@/app/api/assets/[slug]/download/route";
import promptRequest from "../../../examples/requests/lifecore-prompt.json";
import referenceRequest from "../../../examples/requests/lifecore-reference.json";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("LifeCore prospect-facing example", () => {
  it("validates the complete six-part brief with LifeCore as seller, not prospect", () => {
    expect(assetDocumentSchema.safeParse(lifecoreWellnessAsset).success).toBe(true);
    expect(lifecoreWellnessAsset.preparedFor).toBe("Northstar Software");
    expect(lifecoreWellnessAsset.preparedBy).toContain("LifeCore");
    expect(lifecoreWellnessAsset.sections.map((section) => section.id)).toEqual([
      "current-situation", "likely-problem", "solution", "alternatives",
    ]);
    expect(lifecoreWellnessAsset.callToAction?.message).toContain("coverage comparison");
  });

  it("labels the scenario without inventing research, company history, or a gift", () => {
    expect(lifecoreWellnessAsset.documentLabel).toContain("fictional example");
    expect(lifecoreWellnessAsset.useNote).toContain("scenario assumptions");
    expect(lifecoreWellnessAsset.sources).toEqual([]);
    expect(lifecoreWellnessAsset.gift.status).toBe("omitted");
    expect(lifecoreWellnessAsset.approvedGiftOffer).toBeUndefined();
    expect(lifecoreWellnessAsset.sections[1].items.map((item) => item.classification)).toEqual(["inference", "unknown"]);
    expect(lifecoreWellnessAsset.companyDomain).toBeUndefined();
    expect(lifecoreWellnessAsset.logoUrl).toBeUndefined();
  });

  it("provides a usable coverage check, pilot checklist and fair alternatives", () => {
    const solution = lifecoreWellnessAsset.sections[2];
    expect(solution.items[0].procedure?.map((step) => step.label)).toEqual(["Main-office team", "Second-office team", "Remote team"]);
    expect(solution.items[1].checks).toHaveLength(3);
    expect(solution.items[2].procedure).toHaveLength(3);
    const alternatives = lifecoreWellnessAsset.sections[3];
    expect(alternatives.items).toHaveLength(4);
    for (const item of alternatives.items) expect(item.cells).toHaveLength(alternatives.columns!.length);
  });

  it("renders distinct branding and the requested order without Linear content or private context", () => {
    const html = renderToStaticMarkup(createElement(AssetView, { asset: toPublicAsset(lifecoreWellnessAsset) }));
    expect(html).toContain("--brand-ink:#143E34");
    expect(html).toContain("Wellness coverage plan · fictional example");
    expect(html.indexOf('id="current-situation"')).toBeLessThan(html.indexOf('id="solution"'));
    expect(html.indexOf('id="alternatives"')).toBeLessThan(html.indexOf('id="cta-title"'));
    expect(html).not.toMatch(/Linear|SCIM|Triage|SupportLoop|task5Hook|warnings|Sources &amp; assumptions/);
    expect(html).not.toContain(lifecoreWellnessAsset.task5Hook);
  });

  it("exports all the useful work but not the separate email", () => {
    const text = assetToMarkdown(toPublicAsset(lifecoreWellnessAsset));
    expect(text).toContain("Main-office team:");
    expect(text).toContain("Repeat use:");
    expect(text).toContain("- [ ] Confirm participating venues");
    expect(text).toContain("## See how it would work");
    expect(text).not.toContain(lifecoreWellnessAsset.task5Hook);
  });

  it("retrieves both references without a generator or storage service", async () => {
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const result = await createPersonalizedAsset(assetRequestSchema.parse(referenceRequest));
    expect(result.asset.slug).toBe(lifecoreWellnessAsset.slug);
    expect(result.storage).toBe("bundled");
    expect(await getAsset(lifecoreWellnessAsset.slug)).toBe(lifecoreWellnessAsset);
    expect(await getAsset(linearSupportAsset.slug)).toBe(linearSupportAsset);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns the LifeCore URL through POST with honest reference mode and working read/download endpoints", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("ASSET_API_KEY", "");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    const response = await POST(new NextRequest("http://localhost/api/assets", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(referenceRequest),
    }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.slug).toBe("lifecore-northstar-wellness");
    expect(result.generationMode).toBe("reference");
    expect(result.storage).toBe("bundled");
    const publicResponse = await GET(new NextRequest(result.assetUrl), { params: Promise.resolve({ slug: result.slug }) });
    expect(publicResponse.status).toBe(200);
    expect(JSON.stringify(await publicResponse.json())).not.toMatch(/task5Hook|warnings|generationMode/);
    const exported = await download(new Request("http://localhost/test"), { params: Promise.resolve({ slug: result.slug }) });
    expect(exported.status).toBe(200);
    expect(await exported.text()).toContain("Make your wellness benefit work beyond the head office.");
  });

  it("keeps prompt input distinct from selecting the authored example", () => {
    expect(assetRequestSchema.safeParse(promptRequest).success).toBe(true);
    expect(assetRequestSchema.parse(promptRequest).example).toBeUndefined();
    expect(assetRequestSchema.parse(referenceRequest).example).toBe("lifecore-wellness");
  });
});
