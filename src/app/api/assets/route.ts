import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { normalizeAssetRequest } from "@/lib/normalize";
import { createPersonalizedAsset } from "@/lib/orchestrator";
import { GenerationUnavailableError } from "@/lib/generation/generator";
import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BODY_BYTES = 200_000;

function isAuthorized(request: NextRequest): boolean {
  const keys = [process.env.ASSET_API_KEY, process.env.ASSET_OPERATOR_API_KEY].filter((key): key is string => Boolean(key));
  if (!keys.length) return !process.env.VERCEL;
  const supplied = createHash("sha256").update(request.headers.get("authorization") || "").digest();
  return keys.some(key => timingSafeEqual(supplied, createHash("sha256").update(`Bearer ${key}`).digest()));
}

async function parseBody(request: NextRequest): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_BODY_BYTES)
    throw new Error("Request body exceeds 200 KB.");

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    throw new Error("Request body exceeds 200 KB.");
  }
  if (!raw.trim()) throw new Error("Request body is empty.");

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Request body is not valid JSON.");
    }
  }
  return raw;
}

export async function POST(request: NextRequest) {
  const startedAt = performance.now();

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const body = await parseBody(request);
    const input = normalizeAssetRequest(body);
    const { asset, storage, generation } = await createPersonalizedAsset(
      input,
      request.headers.get("idempotency-key"),
    );
    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      request.nextUrl.origin;

    return NextResponse.json({
      success: true,
      slug: asset.slug,
      assetType: asset.assetType,
      assetTitle: asset.title,
      assetUrl: `${origin}/a/${asset.slug}`,
      generationMode: asset.generationMode,
      task5Hook: asset.task5Hook,
      storage,
      generation,
      warnings: asset.warnings,
      executionTimeMs: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown generation error.";
    const details = error instanceof ZodError ? error.issues : undefined;
    const code =
      error instanceof GenerationUnavailableError ? error.code : undefined;
    console.error("asset_generation_failed", { message, details });
    return NextResponse.json(
      { success: false, error: message, code, details },
      {
        status:
          error instanceof ZodError
            ? 422
            : error instanceof GenerationUnavailableError
              ? 503
              : 400,
      },
    );
  }
}
