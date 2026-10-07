import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claudeEnvironment, checkClaude, writeWithClaude, WriterError } from "./claude";
import { createWriterServer } from "./server";

async function main() {
  // A private, empty working directory, not the user's repo or original worker.
  const workspace = await mkdtemp(join(tmpdir(), "personalized-asset-writer-"));
  const removeWorkspace = () => rm(workspace, { recursive: true, force: true });
  const options = { executable: process.env.ASSET_CLAUDE_BIN || "claude", cwd: workspace, env: claudeEnvironment() };
  try {
    await checkClaude(options);
    if (process.argv.includes("--check")) {
      console.log(JSON.stringify({ ready: true, generationTested: false }));
      await removeWorkspace(); return;
    }
    const host = process.env.ASSET_WORKER_HOST || "127.0.0.1";
    const port = Number(process.env.ASSET_WORKER_PORT || "8791");
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid port");
    const writer = createWriterServer({
      token: process.env.ASSET_GENERATOR_TOKEN || "",
      maxConcurrent: Number(process.env.ASSET_WORKER_CONCURRENCY || "1"),
      generate: (input, signal) => writeWithClaude(input, { ...options, signal }),
    });
    await new Promise<void>((resolve, reject) => {
      writer.server.once("error", reject);
      writer.server.listen(port, host, resolve);
    });
    console.log(JSON.stringify({ listening: true, host, port, researchMode: "supplied_context_only", generationTested: false }));
    let shuttingDown = false;
    const shutdown = async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      await writer.close();
      await removeWorkspace();
    };
    process.once("SIGINT", () => { void shutdown(); });
    process.once("SIGTERM", () => { void shutdown(); });
  } catch (error) {
    await removeWorkspace();
    console.error(JSON.stringify({ ready: false, error: error instanceof WriterError ? error.code : "writer_configuration_failed" }));
    process.exitCode = 1;
  }
}

void main();
