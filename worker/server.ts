import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z } from "zod";
import { assetRequestSchema, type AssetRequest, type GeneratedAsset } from "../src/lib/schemas";
import { WriterError } from "./claude";
import type { ResearchedGeneration } from "../src/lib/generation/research-envelope";

const envelopeSchema = z.object({
  input: assetRequestSchema,
  // Accepted for compatibility with the forwarder, but never used as executable
  // instructions or a replacement schema. The repo owns the writing contract.
  systemPrompt: z.string().max(30_000).optional(),
  outputSchema: z.unknown().optional(),
}).strict();

export const MAX_CONCURRENT_ASSETS = 10;

function send(response: ServerResponse, status: number, value: unknown) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, {
    "Content-Type": "application/json", "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...(status === 429 ? { "Retry-After": "3" } : {}),
  });
  response.end(JSON.stringify(value));
}

function body(request: IncomingMessage, signal: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      request.off("data", data); request.off("end", end); request.off("error", error);
      signal.removeEventListener("abort", abort);
    };
    const fail = (failure: WriterError) => {
      if (settled) return;
      settled = true; cleanup(); request.resume(); reject(failure);
    };
    const data = (chunk: Buffer) => {
      size += chunk.length;
      if (size > 512_000) fail(new WriterError("request_too_large", 413));
      else chunks.push(chunk);
    };
    const end = () => {
      if (settled) return;
      try {
        const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        settled = true; cleanup(); resolve(value);
      } catch { fail(new WriterError("invalid_json", 400)); }
    };
    const error = () => fail(new WriterError("invalid_request", 400));
    const abort = () => fail(new WriterError("request_cancelled", 499));
    const timer = setTimeout(() => fail(new WriterError("request_timeout", 408)), 5000);
    request.on("data", data); request.on("end", end); request.on("error", error);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

export function createWriterServer(options: {
  token: string;
  maxConcurrent?: number;
  mode?: "codex_cli" | "claude_cli";
  generate: (input: AssetRequest, signal: AbortSignal) => Promise<GeneratedAsset | ResearchedGeneration>;
}) {
  if (options.token.trim().length < 32) throw new Error("A private service token of at least 32 characters is required.");
  const limit = options.maxConcurrent ?? MAX_CONCURRENT_ASSETS;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CONCURRENT_ASSETS) throw new Error("Concurrency must be 1–10.");
  const expected = createHash("sha256").update(`Bearer ${options.token}`).digest();
  const controllers = new Set<AbortController>();
  const pending = new Set<Promise<void>>();
  let accepting = true;
  const server = createServer(async (request, response) => {
    const supplied = createHash("sha256").update(request.headers.authorization ?? "").digest();
    if (!timingSafeEqual(expected, supplied)) { send(response, 401, { error: "unauthorized" }); request.resume(); return; }
    if (request.method === "GET" && request.url === "/health") {
      // This is process readiness, not a model request or a latency assertion.
      send(response, 200, { ok: accepting, mode: options.mode ?? "claude_cli", researchMode: options.mode === "codex_cli" ? "parallel_public_research" : "supplied_context_only", active: controllers.size, capacity: limit }); return;
    }
    if (request.method !== "POST" || request.url !== "/generate") { send(response, 404, { error: "not_found" }); request.resume(); return; }
    if (!accepting) { send(response, 503, { error: "shutting_down" }); request.resume(); return; }
    if (controllers.size >= limit) { send(response, 429, { error: "writer_busy" }); request.resume(); return; }
    if (request.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
      send(response, 415, { error: "json_required" }); request.resume(); return;
    }
    const controller = new AbortController();
    controllers.add(controller);
    let finish!: () => void;
    const completion = new Promise<void>((resolve) => { finish = resolve; });
    pending.add(completion);
    const disconnect = () => { if (!response.writableFinished) controller.abort(); };
    response.on("close", disconnect);
    request.on("aborted", disconnect);
    try {
      const parsed = envelopeSchema.safeParse(await body(request, controller.signal));
      if (!parsed.success || parsed.data.input.example) throw new WriterError("invalid_request", 400);
      const result = await options.generate(parsed.data.input, controller.signal);
      send(response, 200, result);
    } catch (error) {
      const failure = error instanceof WriterError ? error : new WriterError("generation_failed");
      const knownContractReasons = ["Generator returned an unsupplied reference URL.", "Generator did not return the requested six-part structure."];
      const reason = error instanceof z.ZodError ? error.issues.map(issue => ({ field: issue.path.join("."), rule: issue.code })) : error instanceof Error && knownContractReasons.includes(error.message) ? error.message : undefined;
      console.warn(JSON.stringify({ event: "asset_worker_failed", code: failure.code, status: failure.status, reason }));
      send(response, failure.status, { error: failure.code });
    } finally {
      controllers.delete(controller);
      pending.delete(completion); finish();
      response.off("close", disconnect); request.off("aborted", disconnect);
    }
  });
  server.headersTimeout = 10_000;
  server.requestTimeout = 90_000;
  server.keepAliveTimeout = 5000;
  server.maxHeadersCount = 30;
  return {
    server,
    close: async () => {
      accepting = false;
      for (const controller of controllers) controller.abort();
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      });
      await Promise.all(pending);
    },
  };
}
