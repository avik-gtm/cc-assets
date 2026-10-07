import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { assetToMarkdown, toPublicAsset } from "@/lib/public-asset";
import { assetRequestSchema, generatedAssetSchema } from "@/lib/schemas";
import {
  generateAsset,
  GenerationUnavailableError,
} from "@/lib/generation/generator";
import { createPersonalizedAsset } from "@/lib/orchestrator";
import { getAsset, saveAsset } from "@/lib/storage";
import { AssetView } from "@/components/AssetView";
import { DemoForm } from "@/components/DemoForm";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";
import { POST } from "@/app/api/assets/route";
import { GET } from "@/app/api/assets/[slug]/route";
import { GET as download } from "@/app/api/assets/[slug]/download/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("recipient-first support reference", () => {
  it("validates the six-part brief with sourced facts, hypotheses, solution, alternatives and CTA", () => {
    expect(generatedAssetSchema.safeParse(linearSupportAsset).success).toBe(
      true,
    );
    const facts = linearSupportAsset.sections[0].items;
    expect(facts).toHaveLength(3);
    for (const card of facts) {
      expect(card.classification).toBe("fact");
      expect(card.description).not.toMatch(/Hi \[first name\]|Subject:/);
      expect(
        linearSupportAsset.sources.some(
          (source) => source.url === card.sourceUrl,
        ),
      ).toBe(true);
    }
    expect(linearSupportAsset.sections.map((section) => section.id)).toEqual([
      "current-situation",
      "likely-problem",
      "solution",
      "alternatives",
    ]);
    expect(linearSupportAsset.sections[1].items[0].classification).toBe(
      "inference",
    );
    expect(linearSupportAsset.sections[2].items[0].procedure).toHaveLength(3);
    expect(linearSupportAsset.sections[3].items).toHaveLength(3);
    expect(linearSupportAsset.callToAction?.message).toContain(
      "Happy to walk you through",
    );
  });

  it("removes operator handoff, warnings and research seeds from public data", () => {
    const data = toPublicAsset({
      ...linearSupportAsset,
      personLinkedInUrl: "https://linkedin.com/in/private-seed",
      warnings: ["PRIVATE_WARNING"],
      task5Hook: "PRIVATE_OUTREACH",
      generationMode: "agent",
    });
    expect(JSON.stringify(data)).not.toMatch(
      /PRIVATE_|private-seed|task5Hook|generationMode|warnings|classification/,
    );
    expect(data.gift).toEqual({ status: "omitted" });
  });

  it("renders the requested order and public CTA without private qualification context", () => {
    const html = renderToStaticMarkup(
      createElement(AssetView, { asset: toPublicAsset(linearSupportAsset) }),
    );
    expect(html).toContain("linear-wordmark-dark.svg");
    expect(html.indexOf("Invitations depend on provisioning")).toBeLessThan(
      html.indexOf('aria-label="Reference links"'),
    );
    expect(html).not.toMatch(
      /Qualification context|Priority score|Task 5|matched the supplied universe|PRIVATE_/,
    );
    expect(html).toContain("Not an official");
    expect(html).toContain("Document contents");
    expect(html).toContain("document-cover");
    expect(html).toContain("Expand all");
    expect(html).toContain("Collapse all");
    expect(html).toMatch(/<details[^>]+id="current-situation"[^>]+open=""/);
    expect(html).toMatch(/<details[^>]+id="alternatives"[^>]+open=""/);
    expect(html).not.toContain("document-sidebar");
    expect(html).not.toContain("Implementation notes");
    expect(html).toContain("See how it would work");
    expect(html).not.toContain("Copy template");
    expect(html).toContain("decision-path");
    expect(html).toContain("SCIM versus workspace-managed");
    expect(html).not.toMatch(
      /Sources &amp; assumptions|source-chapter|href="#sources"/,
    );
    expect(html).not.toMatch(
      /Response draft|Subject<|Hi \[first name\]|Open the kit|Take the kit|Less blank page|Before sending|message-window/,
    );
  });

  it("keeps uncertainty in prose and sources without exposing internal classification labels", () => {
    const asset = toPublicAsset({
      ...linearSupportAsset,
      evidence: [
        {
          label: "Proposed owner",
          value: "Support lead",
          detail: "A suggestion, not a verified internal role.",
          classification: "inference",
          sourceUrl: "https://example.com/supplied-reference",
        },
      ],
    });
    const html = renderToStaticMarkup(createElement(AssetView, { asset }));
    expect(html).toContain("Background for these recommendations");
    expect(html).not.toMatch(/evidence-label|>inference<|>unknown<|>fact</);
    expect(html).toContain("A suggestion, not a verified internal role.");
    expect(html).toContain("https://example.com/supplied-reference");
    expect(html).not.toContain("Sources &amp; assumptions");
    const markdown = assetToMarkdown(asset);
    expect(markdown).not.toMatch(/Evidence: (fact|inference|unknown)|\[(fact|inference|unknown)\]/);
    expect(markdown).toContain("A suggestion, not a verified internal role.");
    expect(JSON.stringify(asset)).not.toContain('"classification"');
    expect(linearSupportAsset.sections[1].items[0].classification).toBe("inference");
    expect(markdown).toContain("Invitation: Identify SCIM");
  });

  it("instructs the writer to combine supported signals with company context in natural language", () => {
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("Combine the relevant supplied Task 2 signals with broader company/product/team context");
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("A signal is usable as a fact only when its supplied evidence supports it");
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("Classification values fact/inference/unknown are internal metadata");
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("Removing labels must never turn an assumption into an asserted fact");
  });

  it("exports the actual content, ownership matrix and sources without private fields", () => {
    const markdown = assetToMarkdown(toPublicAsset(linearSupportAsset));
    expect(markdown).toContain("## Your best options");
    expect(markdown).toContain("Best fit:");
    expect(markdown).toContain("- [ ] Confirm the requester is authorized.");
    expect(markdown).toContain("https://linear.app/docs/triage");
    expect(markdown).not.toContain(linearSupportAsset.task5Hook);
    expect(markdown).not.toMatch(/Subject:|Hi \[first name\]/);
  });

  it.each([
    "audit",
    "map",
    "report",
    "comparison",
    "action_plan",
    "toolkit",
  ] as const)(
    "keeps the %s shell independent of the support example",
    (assetType) => {
      const asset = toPublicAsset({
        ...linearSupportAsset,
        documentFormat: undefined,
        callToAction: undefined,
        assetType,
        preparedFor: "Northstar Commerce",
        logoUrl: undefined,
        title: "Checkout testing plan",
        subtitle: "Fictional practice document",
        documentLabel: "Accessibility / Testing",
        recipientTitle: "Digital Product",
        preparedBy: "AccessProof concept",
        useNote: "Proposed test plan, not a completed audit.",
        executiveSummary: "Test checkout journeys before release.",
        nonObviousInsight: "A redesign is not proof of defects.",
        sources: [],
        sections: [
          {
            id: "test-plan",
            title: "Test plan",
            layout: "table",
            columns: ["Journey", "Check"],
            items: [
              {
                title: "Checkout",
                description: "Proposed test",
                cells: ["Checkout", "Keyboard navigation"],
              },
            ],
          },
          {
            id: "release",
            title: "Release checklist",
            layout: "checklist",
            items: [
              {
                title: "Review",
                description: "Proposed gate",
                checks: ["Record test results"],
              },
            ],
          },
        ],
        recommendedActions: ["Assign test owners."],
      });
      const html = renderToStaticMarkup(createElement(AssetView, { asset }));
      expect(html).toContain("Checkout testing plan");
      expect(html).toContain("Keyboard navigation");
      expect(html).toContain("No verified source material supplied");
      expect(html).not.toMatch(
        /Linear|SupportLoop|First week|support kit|Response draft|Subject</,
      );
    },
  );

  it("keeps legacy layouts readable without turning values into email subjects", () => {
    const asset = toPublicAsset({
      ...linearSupportAsset,
      documentFormat: undefined,
      sections: linearSupportAsset.sections.map((section) =>
        section.id === "solution"
          ? {
              ...section,
              layout: "replies",
              items: [{ ...section.items[0], value: "Case reference" }],
            }
          : section,
      ),
    });
    const html = renderToStaticMarkup(createElement(AssetView, { asset }));
    expect(html).toContain("Case reference");
    expect(html).toContain("Copy template");
    expect(html).not.toMatch(/Subject|Response draft|message-window/);
    expect(assetToMarkdown(asset)).not.toContain("Subject:");
  });

  it("prepares a single prompt body without offering an unauthenticated generation action", () => {
    const html = renderToStaticMarkup(createElement(DemoForm));
    expect(html).toContain("Copy JSON body");
    expect(html).toContain("&quot;prompt&quot;");
    expect(html).toContain("does not call the generator");
    expect(html).not.toMatch(/Generate from prompt|Test API with authored/);
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("NOT an email");
    expect(PERSONALIZED_ASSET_SYSTEM_PROMPT).toContain("only in task5Hook");
  });

  it("does not expose suggested gifts as issued gifts", () => {
    const asset = toPublicAsset({
      ...linearSupportAsset,
      gift: {
        status: "suggested",
        preference: "coffee",
        sourceUrl: "https://example.com/hobby",
      },
    });
    expect(asset.gift).toEqual({ status: "omitted" });
  });

  it("shows an approved offer in the CTA without pretending a voucher exists", () => {
    const asset = toPublicAsset({ ...linearSupportAsset, approvedGiftOffer: { label: "a coffee gift card" } });
    const html = renderToStaticMarkup(createElement(AssetView, { asset }));
    expect(html).toContain("happy to send over");
    expect(html).toContain("a coffee gift card");
    expect(html).not.toContain("View gift");
    expect(assetToMarkdown(asset)).toContain("a coffee gift card");
  });

  it("rejects script URLs and malformed table rows", () => {
    expect(
      generatedAssetSchema.safeParse({
        ...linearSupportAsset,
        logoUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      generatedAssetSchema.safeParse({
        ...linearSupportAsset,
        sources: [{ label: "bad", url: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
    expect(
      generatedAssetSchema.safeParse({
        ...linearSupportAsset,
        sections: [
          { ...linearSupportAsset.sections[3], columns: ["Only one"] },
          linearSupportAsset.sections[0],
        ],
      }).success,
    ).toBe(false);
  });
});

describe("honest generation modes", () => {
  it("requires an explicit reference request and makes no model calls", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const result = await generateAsset(
      assetRequestSchema.parse({
        example: "linear-support",
        prompt: "Make this about a different company",
      }),
    );
    expect(result.mode).toBe("reference");
    expect(result.asset.preparedFor).toBe("Linear");
    expect(result.warnings.join(" ")).toContain("did not generate");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not pretend a plain prompt was generated without a service", async () => {
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    await expect(
      generateAsset(
        assetRequestSchema.parse({ prompt: "Build for a new support company" }),
      ),
    ).rejects.toBeInstanceOf(GenerationUnavailableError);
  });

  it("passes the actual schema to an approved service and parses the result", async () => {
    vi.stubEnv("ASSET_GENERATOR_URL", "https://generator.example.test");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(linearSupportAsset)));
    vi.stubGlobal("fetch", fetcher);
    const result = await generateAsset(
      assetRequestSchema.parse({ prompt: JSON.stringify(linearSupportAsset) }),
    );
    expect(result.mode).toBe("agent");
    expect(
      JSON.parse(fetcher.mock.calls[0][1].body).outputSchema.properties
        .sections,
    ).toBeDefined();
  });

  it("does not silently publish fallback copy after a service failure", async () => {
    vi.stubEnv("ASSET_GENERATOR_URL", "https://generator.example.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("unavailable", { status: 500 })),
    );
    await expect(
      generateAsset(
        assetRequestSchema.parse({ prompt: "Build the support kit" }),
      ),
    ).rejects.toThrow("No placeholder was published");
  });

  it("serves the same durable bundled reference without Blob or process memory", async () => {
    const result = await createPersonalizedAsset(
      assetRequestSchema.parse({ example: "linear-support" }),
    );
    expect(result.storage).toBe("bundled");
    expect(await getAsset(result.asset.slug)).toEqual(linearSupportAsset);
  });

  it("blocks ephemeral production publication when durable storage is absent", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    await expect(
      saveAsset({ ...linearSupportAsset, slug: "test-only" }),
    ).rejects.toThrow("Durable asset storage");
  });

  it("never persists the original private handoff in the public storage record", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    await saveAsset({
      ...linearSupportAsset,
      slug: "privacy-test",
      task5Hook: "PRIVATE_PITCH",
      warnings: ["PRIVATE_WARNING"],
    });
    const stored = await getAsset("privacy-test");
    expect(JSON.stringify(stored)).not.toMatch(/PRIVATE_PITCH|PRIVATE_WARNING/);
  });
});

describe("API boundaries", () => {
  it.each(["existing-clay-key", "separate-operator-key"])("preserves both authorized keys: %s", async (key) => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("ASSET_API_KEY", "existing-clay-key");
    vi.stubEnv("ASSET_OPERATOR_API_KEY", "separate-operator-key");
    const response = await POST(new NextRequest("https://cc.getattn.io/api/assets", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ example: "linear-support" }),
    }));
    expect(response.status).toBe(200);
    expect((await response.json()).assetUrl).toContain("https://cc.getattn.io/a/");
  });
  it("rejects incorrect credentials even when an operator key is configured", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("ASSET_API_KEY", "existing-clay-key");
    vi.stubEnv("ASSET_OPERATOR_API_KEY", "separate-operator-key");
    const response = await POST(new NextRequest("https://cc.getattn.io/api/assets", {
      method: "POST", headers: { Authorization: "Bearer wrong" }, body: "test",
    }));
    expect(response.status).toBe(401);
  });
  it("downloads an editable recipient-only document with an attachment header", async () => {
    const response = await download(new Request("http://localhost/test"), {
      params: Promise.resolve({ slug: linearSupportAsset.slug }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      "attachment;",
    );
    const text = await response.text();
    expect(text).toContain("## Current situation");
    expect(text).toContain("## See how it would work");
    expect(text).not.toContain(linearSupportAsset.task5Hook);
  });
  it("returns a reference URL and public JSON without the private hook", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("ASSET_API_KEY", "");
    const response = await POST(
      new NextRequest("http://localhost/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ example: "linear-support" }),
      }),
    );
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.generationMode).toBe("reference");
    expect(result.storage).toBe("bundled");
    const publicResponse = await GET(new NextRequest(result.assetUrl), {
      params: Promise.resolve({ slug: result.slug }),
    });
    expect(JSON.stringify(await publicResponse.json())).not.toContain(
      "task5Hook",
    );
  });

  it("reports missing generation as 503, not success", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("ASSET_API_KEY", "");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    const response = await POST(
      new NextRequest("http://localhost/api/assets", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Create a new prospect asset",
      }),
    );
    expect(response.status).toBe(503);
    expect((await response.json()).success).toBe(false);
  });

  it("fails closed on an unconfigured hosted API", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("ASSET_API_KEY", "");
    const response = await POST(
      new NextRequest("https://example.com/api/assets", {
        method: "POST",
        body: "test",
      }),
    );
    expect(response.status).toBe(401);
  });
});
