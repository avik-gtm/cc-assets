import {
  generatedAssetSchema,
  type AssetRequest,
  type GeneratedAsset,
} from "@/lib/schemas";
import { z } from "zod";
import { getReferenceAsset } from "@/lib/examples/references";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";
import { CONTEXT_ONLY_RULES } from "./context-rules";
import { validateGeneratedAsset } from "./contract";
import { researchedGenerationSchema } from "./research-envelope";

export type GenerationResult = {
  asset: GeneratedAsset;
  mode: "reference" | "agent";
  warnings: string[];
  metadata?: {
    provider: "external";
    researchMode: "supplied_context_only" | "parallel_public_research";
    verifiedSourceCount?: number;
    completedResearchBranches?: number;
  };
};

export class GenerationUnavailableError extends Error {
  constructor(
    message: string,
    readonly code = "generation_failed",
  ) {
    super(message);
    this.name = "GenerationUnavailableError";
  }
}

async function callApprovedAgentService(
  input: AssetRequest,
): Promise<{ asset: GeneratedAsset; research?: { sourceCount: number; completed: number } }> {
  const endpoint = process.env.ASSET_GENERATOR_URL;
  if (!endpoint) throw new Error("ASSET_GENERATOR_URL is not configured.");
  const url = new URL(endpoint);
  const localDevelopment =
    !process.env.VERCEL &&
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(localDevelopment && url.protocol === "http:"))
  ) {
    throw new Error(
      "Generator URL must use HTTPS without embedded credentials.",
    );
  }
  if (process.env.VERCEL && !process.env.ASSET_GENERATOR_TOKEN) {
    throw new Error("Hosted generation requires a private service token.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ASSET_GENERATOR_TOKEN
        ? { Authorization: `Bearer ${process.env.ASSET_GENERATOR_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      systemPrompt: `${PERSONALIZED_ASSET_SYSTEM_PROMPT}\n${CONTEXT_ONLY_RULES}`,
      input,
      outputSchema: z.toJSONSchema(generatedAssetSchema),
    }),
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
    redirect: "error",
  });

  if (!response.ok) {
    throw new Error(`Agent service returned ${response.status}.`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Generator returned an empty body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_000_000) throw new Error("Generator response exceeds 1 MB.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (value && typeof value === "object" && "research" in value) {
    const envelope = researchedGenerationSchema.parse(value);
    const enrichedInput = { ...input, logoUrl: input.logoUrl || envelope.research.brand?.logoUrl, sourceUrls: [...input.sourceUrls, ...envelope.research.sources.map(source => source.url)] };
    return {
      asset: validateGeneratedAsset(envelope.asset, enrichedInput),
      research: { sourceCount: envelope.research.sources.length, completed: envelope.research.branches.filter(branch => branch.status === "complete").length },
    };
  }
  return { asset: validateGeneratedAsset(value, input) };
}

export async function generateAsset(
  input: AssetRequest,
): Promise<GenerationResult> {
  if (input.example) {
    return {
      asset: generatedAssetSchema.parse(getReferenceAsset(input.example)),
      mode: "reference",
      warnings: [
        "Returning the selected authored reference. The prompt did not generate or change its contents.",
      ],
    };
  }
  if (!process.env.ASSET_GENERATOR_URL) {
    throw new GenerationUnavailableError(
      "The separate content generator is not connected yet. The website and authored reference remain available. No placeholder asset was published.",
      "generation_not_configured",
    );
  }

  try {
    const result = await callApprovedAgentService(input);
    return {
      asset: result.asset,
      mode: "agent",
      metadata: result.research ? {
        provider: "external", researchMode: "parallel_public_research",
        verifiedSourceCount: result.research.sourceCount,
        completedResearchBranches: result.research.completed,
      } : { provider: "external", researchMode: "supplied_context_only" },
      warnings: result.research ? [
        `Public research checked ${result.research.sourceCount} source(s); ${result.research.completed}/3 research branches completed within the time budget. Unverified findings were omitted.`,
      ] : [
        "Generated from supplied context only. No live website, LinkedIn, or accessibility audit was performed.",
      ],
    };
  } catch {
    console.error("approved_generator_failed", "generation_failed");
    throw new GenerationUnavailableError(
      "The separate content generator could not complete this request. No placeholder was published; the authored reference remains available.",
      "generation_failed",
    );
  }
}
