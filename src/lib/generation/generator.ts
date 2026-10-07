import {
  generatedAssetSchema,
  type AssetRequest,
  type GeneratedAsset,
} from "@/lib/schemas";
import { z } from "zod";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";

export type GenerationResult = {
  asset: GeneratedAsset;
  mode: "reference" | "agent";
  warnings: string[];
};

export class GenerationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationUnavailableError";
  }
}

async function callApprovedAgentService(
  input: AssetRequest,
): Promise<GeneratedAsset> {
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
      outputSchema: z.toJSONSchema(generatedAssetSchema),
    }),
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Agent service returned ${response.status}.`);
  }

  return generatedAssetSchema.parse(await response.json());
}

export async function generateAsset(
  input: AssetRequest,
): Promise<GenerationResult> {
  if (input.example === "linear-support") {
    return {
      asset: generatedAssetSchema.parse(linearSupportAsset),
      mode: "reference",
      warnings: [
        "Returning the authored Linear reference. The prompt did not generate or change its contents.",
      ],
    };
  }
  if (!process.env.ASSET_GENERATOR_URL) {
    throw new GenerationUnavailableError(
      "New-company generation is not configured. Open the authored reference at /examples/linear-support, or connect an approved service with ASSET_GENERATOR_URL. No placeholder asset was published.",
    );
  }

  try {
    return {
      asset: await callApprovedAgentService(input),
      mode: "agent",
      warnings: [],
    };
  } catch (error) {
    console.error(
      "approved_generator_failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    throw new GenerationUnavailableError(
      "The generation service could not produce a valid asset within its deadline. No placeholder was published; the authored reference remains available.",
    );
  }
}
