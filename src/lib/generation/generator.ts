import {
  generatedAssetSchema,
  type AssetRequest,
  type GeneratedAsset,
} from "@/lib/schemas";
import { z } from "zod";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";
import { generateWithGateway } from "./gateway";

export type GenerationResult = {
  asset: GeneratedAsset;
  mode: "reference" | "agent";
  warnings: string[];
  metadata?: Awaited<ReturnType<typeof generateWithGateway>>["metadata"];
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
  if (!process.env.ASSET_GENERATOR_URL && !process.env.AI_GATEWAY_MODEL) {
    throw new GenerationUnavailableError(
      "New-company generation is not configured. Configure AI_GATEWAY_MODEL with Gateway authentication or connect ASSET_GENERATOR_URL. No placeholder asset was published.",
      "generation_not_configured",
    );
  }

  try {
    if (!process.env.ASSET_GENERATOR_URL) {
      const result = await generateWithGateway(input);
      return {
        asset: result.asset,
        mode: "agent",
        metadata: result.metadata,
        warnings: [
          "Generated from supplied context only. No live website, LinkedIn, or accessibility audit was performed.",
        ],
      };
    }
    return {
      asset: await callApprovedAgentService(input),
      mode: "agent",
      warnings: [],
    };
  } catch (error) {
    // Only the observed Gateway verification response gets this diagnosis.
    // A generic 403, timeout, or invalid output is not evidence of a billing issue.
    const gatewayVerificationRequired =
      !process.env.ASSET_GENERATOR_URL &&
      error instanceof Error &&
      "statusCode" in error &&
      error.statusCode === 403 &&
      /AI Gateway requires a valid credit card on file/i.test(error.message);
    const code = gatewayVerificationRequired
      ? "gateway_verification_required"
      : "generation_failed";
    console.error("approved_generator_failed", code);
    throw new GenerationUnavailableError(
      gatewayVerificationRequired
        ? "Vercel AI Gateway declined generation because its payment-method verification is incomplete. This is a model-service setup requirement, not a diagnosis of Vercel hosting billing. No placeholder was published. The workspace owner must review AI Gateway setup or configure an approved alternative model service."
        : "The generation service failed or returned invalid output. No placeholder was published; the authored reference remains available. Check model-service access and runtime diagnostics before retrying.",
      code,
    );
  }
}
