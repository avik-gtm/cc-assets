import {
  generatedAssetSchema,
  type AssetRequest,
  type GeneratedAsset,
} from "@/lib/schemas";
import { z } from "zod";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "@/lib/generation/system-prompt";
import { CONTEXT_ONLY_RULES } from "./context-rules";
import { validateGeneratedAsset } from "./contract";

export type GenerationResult = {
  asset: GeneratedAsset;
  mode: "reference" | "agent";
  warnings: string[];
  metadata?: {
    provider: "external";
    researchMode: "supplied_context_only";
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
): Promise<GeneratedAsset> {
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
  return validateGeneratedAsset(
    JSON.parse(Buffer.concat(chunks).toString("utf8")),
    input,
  );
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
      "The separate content generator is not connected yet. The website and authored reference remain available. No placeholder asset was published.",
      "generation_not_configured",
    );
  }

  try {
    return {
      asset: await callApprovedAgentService(input),
      mode: "agent",
      metadata: { provider: "external", researchMode: "supplied_context_only" },
      warnings: [
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
