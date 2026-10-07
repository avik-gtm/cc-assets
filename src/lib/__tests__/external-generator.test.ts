import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAsset } from "@/lib/generation/generator";
import { assetRequestSchema } from "@/lib/schemas";
import { linearSupportAsset } from "@/lib/examples/linear-support";

const input = assetRequestSchema.parse({
  prompt: JSON.stringify(linearSupportAsset),
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("external generator only", () => {
  it("has no Gateway fallback even with a stale model variable", async () => {
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    vi.stubEnv("AI_GATEWAY_MODEL", "stale/model");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(generateAsset(input)).rejects.toMatchObject({
      code: "generation_not_configured",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("sends a private authenticated, bounded, no-redirect request with the output contract", async () => {
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubEnv("ASSET_GENERATOR_TOKEN", "private-test-token");
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json(linearSupportAsset));
    vi.stubGlobal("fetch", fetcher);
    const result = await generateAsset(input);
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe("https://generator.example.test/generate");
    expect(options.headers.Authorization).toBe("Bearer private-test-token");
    expect(options.redirect).toBe("error");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(options.body).systemPrompt).toContain("NO browsing");
    expect(JSON.parse(options.body).input).toEqual(input);
    expect(result.metadata).toEqual({
      provider: "external",
      researchMode: "supplied_context_only",
    });
  });

  it.each([401, 403, 429, 500])(
    "does not diagnose billing or leak backend details on %s",
    async (status) => {
      vi.stubEnv(
        "ASSET_GENERATOR_URL",
        "https://generator.example.test/generate",
      );
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            new Response("PRIVATE_BACKEND_DETAILS", { status }),
          ),
      );
      const error = await generateAsset(input).catch((error) => error);
      expect(error.code).toBe("generation_failed");
      expect(error.message).toContain("No placeholder was published");
      expect(error.message).not.toMatch(/PRIVATE_|billing|payment|credit card/);
    },
  );

  it.each([
    "http://generator.example.test/generate",
    "https://name:secret@generator.example.test/generate",
    "https://generator.example.test/generate#fragment",
  ])("rejects unsafe connection configuration: %s", async (endpoint) => {
    vi.stubEnv("ASSET_GENERATOR_URL", endpoint);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(generateAsset(input)).rejects.toMatchObject({
      code: "generation_failed",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires service authentication on hosted deployments", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubEnv("ASSET_GENERATOR_TOKEN", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(generateAsset(input)).rejects.toMatchObject({
      code: "generation_failed",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(["not JSON", "{}", "x".repeat(1_000_001)])(
    "rejects invalid or oversized output",
    async (body) => {
      vi.stubEnv(
        "ASSET_GENERATOR_URL",
        "https://generator.example.test/generate",
      );
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
      await expect(generateAsset(input)).rejects.toMatchObject({
        code: "generation_failed",
      });
    },
  );

  it("rejects invented references", async () => {
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(linearSupportAsset)),
    );
    await expect(
      generateAsset(
        assetRequestSchema.parse({
          prompt: "A fictional practice company with no source material.",
        }),
      ),
    ).rejects.toMatchObject({ code: "generation_failed" });
  });
  it("rejects a generator that ignores the requested section order", async () => {
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            ...linearSupportAsset,
            sections: [...linearSupportAsset.sections].reverse(),
          }),
        ),
    );
    await expect(generateAsset(input)).rejects.toMatchObject({
      code: "generation_failed",
    });
  });

  it("cannot approve its own gift offer", async () => {
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            ...linearSupportAsset,
            approvedGiftOffer: { label: "an invented gift" },
          }),
        ),
    );
    expect(
      (await generateAsset(input)).asset.approvedGiftOffer,
    ).toBeUndefined();
  });

  it("carries an explicitly approved offer without buying or issuing a gift", async () => {
    vi.stubEnv(
      "ASSET_GENERATOR_URL",
      "https://generator.example.test/generate",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(linearSupportAsset)),
    );
    const result = await generateAsset({
      ...input,
      approvedGiftOffer: {
        label: "a coffee gift card",
        policyNote: "No purchase required.",
      },
    });
    expect(result.asset.approvedGiftOffer?.label).toBe("a coffee gift card");
    expect(result.asset.gift.status).toBe("omitted");
  });
});
