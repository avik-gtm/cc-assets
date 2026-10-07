import { afterEach, describe, expect, it, vi } from "vitest";
import { generateText } from "ai";
import { generateAsset } from "@/lib/generation/generator";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { assetRequestSchema } from "@/lib/schemas";

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return { ...actual, generateText: vi.fn() };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("direct Gateway generation", () => {
  it("uses the user's context in a real writer contract, not the reference branch", async () => {
    vi.stubEnv("AI_GATEWAY_MODEL", "provider/test-model");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    vi.mocked(generateText).mockResolvedValue({
      output: linearSupportAsset,
      response: { modelId: "provider/test-model", id: "test-response" },
      usage: { inputTokens: 123, outputTokens: 456 },
    } as never);
    const input = assetRequestSchema.parse({
      prompt: JSON.stringify(linearSupportAsset),
    });
    const result = await generateAsset(input);
    expect(result.mode).toBe("agent");
    expect(result.metadata?.researchMode).toBe("supplied_context_only");
    expect(result.metadata?.outputTokens).toBe(456);
    expect(vi.mocked(generateText).mock.calls[0][0].prompt).toBe(
      JSON.stringify(input),
    );
    expect(vi.mocked(generateText).mock.calls[0][0].system).toContain(
      "NO browsing",
    );
    expect(vi.mocked(generateText).mock.calls[0][0].maxRetries).toBe(0);
  });

  it("rejects unsupplied source and branding URLs instead of publishing them", async () => {
    vi.stubEnv("AI_GATEWAY_MODEL", "provider/test-model");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    vi.mocked(generateText).mockResolvedValue({
      output: linearSupportAsset,
    } as never);
    await expect(
      generateAsset(
        assetRequestSchema.parse({ prompt: "Fictional company. No sources." }),
      ),
    ).rejects.toThrow("No placeholder was published");
  });

  it("does not convert model failure into a successful example", async () => {
    vi.stubEnv("AI_GATEWAY_MODEL", "provider/test-model");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    vi.mocked(generateText).mockRejectedValue(
      new Error("Provider unavailable"),
    );
    await expect(
      generateAsset(assetRequestSchema.parse({ prompt: "AccessProof kit" })),
    ).rejects.toThrow("No placeholder was published");
  });

  it("identifies the specific Gateway verification response without exposing the raw error", async () => {
    vi.stubEnv("AI_GATEWAY_MODEL", "provider/test-model");
    vi.stubEnv("ASSET_GENERATOR_URL", "");
    vi.mocked(generateText).mockRejectedValue(
      Object.assign(
        new Error(
          "AI Gateway requires a valid credit card on file. PRIVATE_PROVIDER_DETAILS",
        ),
        { statusCode: 403 },
      ),
    );
    const error = await generateAsset(
      assetRequestSchema.parse({ prompt: "AccessProof kit" }),
    ).catch((e) => e);
    expect(error.code).toBe("gateway_verification_required");
    expect(error.message).toContain("model-service setup");
    expect(error.message).not.toContain("PRIVATE_PROVIDER_DETAILS");
  });

  it.each([401, 403, 429, 500])(
    "does not label a generic %s as a payment problem",
    async (statusCode) => {
      vi.stubEnv("AI_GATEWAY_MODEL", "provider/test-model");
      vi.stubEnv("ASSET_GENERATOR_URL", "");
      vi.mocked(generateText).mockRejectedValue(
        Object.assign(new Error("Provider denied request"), { statusCode }),
      );
      const error = await generateAsset(
        assetRequestSchema.parse({ prompt: "AccessProof kit" }),
      ).catch((e) => e);
      expect(error.code).toBe("generation_failed");
      expect(error.message).not.toMatch(/billing|payment|credit card/);
    },
  );
});
