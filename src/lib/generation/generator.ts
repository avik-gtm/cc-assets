import {
  generatedAssetSchema,
  type AssetRequest,
  type GeneratedAsset,
} from "@/lib/schemas";
import { generateFallbackAsset } from "@/lib/generation/fallback";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";

export type GenerationResult = {
  asset: GeneratedAsset;
  mode: "fallback" | "agent";
  warnings: string[];
};

async function callApprovedAgentService(input: AssetRequest): Promise<GeneratedAsset> {
  const endpoint = process.env.ASSET_GENERATOR_URL;
  if (!endpoint) throw new Error("ASSET_GENERATOR_URL is not configured.");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ASSET_GENERATOR_TOKEN
        ? { Authorization: `Bearer ${process.env.ASSET_GENERATOR_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      systemPrompt: PERSONALIZED_ASSET_SYSTEM_PROMPT,
      input,
    }),
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Agent service returned ${response.status}.`);
  }

  return generatedAssetSchema.parse(await response.json());
}

export async function generateAsset(input: AssetRequest): Promise<GenerationResult> {
  if (!process.env.ASSET_GENERATOR_URL) {
    return {
      asset: generateFallbackAsset(input),
      mode: "fallback",
      warnings: [],
    };
  }

  try {
    return {
      asset: await callApprovedAgentService(input),
      mode: "agent",
      warnings: [],
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown agent-service failure";
    return {
      asset: generateFallbackAsset(input),
      mode: "fallback",
      warnings: [`Agent generation failed; deterministic fallback used. ${reason}`],
    };
  }
}
