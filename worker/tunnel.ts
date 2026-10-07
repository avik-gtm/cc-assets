import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { resolve } from "node:path";
import { Resolver } from "node:dns/promises";
import { get as httpsGet } from "node:https";
import { put } from "@vercel/blob";
import { ENDPOINT_RECORD_PATH, signEndpointRecord } from "../src/lib/generation/endpoint-record";

async function tunnelHealthy(endpoint: string, token: string) {
  // New quick-tunnel names can remain negatively cached by the local ISP.
  // Resolve just this known tunnel through Cloudflare DNS; retain normal TLS verification.
  const resolver = new Resolver({ timeout: 2000, tries: 1 });
  resolver.setServers(["1.1.1.1", "1.0.0.1"]);
  const url = new URL("/health", endpoint);
  const addresses = await resolver.resolve4(url.hostname);
  if (!addresses.length) throw new Error("Tunnel DNS unavailable.");
  await new Promise<void>((done, reject) => {
    const request = httpsGet(url, {
      family: 4, agent: false,
      lookup: (_hostname, _options, callback) => callback(null, addresses[0], 4),
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(7_000),
    }, response => {
      response.resume();
      if (response.statusCode === 200) done(); else reject(new Error("Tunnel health check failed."));
    });
    request.once("error", reject);
  });
}

async function main() {
  const root = process.cwd();
  const workerEnv = parseEnv(await readFile(resolve(root, ".env.worker.local"), "utf8"));
  const storageEnv = parseEnv(await readFile(resolve(root, ".env.local"), "utf8"));
  const token = workerEnv.ASSET_GENERATOR_TOKEN || "";
  const blobToken = storageEnv.BLOB_READ_WRITE_TOKEN || "";
  if (!token || token.length < 24 || !blobToken) throw new Error("Private tunnel configuration missing.");
  const port = Number(workerEnv.ASSET_WORKER_PORT || "8791");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid worker port.");
  const child = spawn("/opt/homebrew/bin/cloudflared", [
    "tunnel", "--url", `http://127.0.0.1:${port}`, "--no-autoupdate", "--protocol", "http2",
  ], { stdio: ["ignore", "pipe", "pipe"], env: { NODE_ENV: "production", PATH: "/opt/homebrew/bin:/usr/bin:/bin", HOME: process.env.HOME } });
  let endpoint: string | undefined;
  let running = false;
  let stopping = false;
  let failures = 0;
  let registered = false;
  let outputTail = "";
  let lastSuccess = Date.now();
  async function register() {
    if (!endpoint || running || stopping) return;
    running = true;
    let stage = "health";
    try {
      await tunnelHealthy(endpoint, token);
      stage = "registration";
      const record = signEndpointRecord(endpoint, token);
      await put(ENDPOINT_RECORD_PATH, JSON.stringify(record), {
        token: blobToken, access: "public", addRandomSuffix: false, allowOverwrite: true,
        contentType: "application/json", cacheControlMaxAge: 0, abortSignal: AbortSignal.timeout(10_000),
      });
      await writeFile(resolve(root, ".runtime/tunnel-status.json"), JSON.stringify({
        ready: true, endpoint, refreshedAt: new Date().toISOString(), pid: process.pid, tunnelPid: child.pid,
      }), { mode: 0o600 });
      failures = 0;
      lastSuccess = Date.now();
      if (!registered) console.log(JSON.stringify({ tunnelRegistered: true, at: new Date().toISOString() }));
      registered = true;
    } catch (error) {
      failures++;
      console.error(JSON.stringify({ tunnelRefreshFailed: true, stage, errorType: error instanceof Error ? error.name : "unknown", consecutiveFailures: failures }));
      // An expired/disconnected connector is replaced by launchd, without a terminal.
      if (failures >= 6) child.kill("SIGTERM");
    } finally { running = false; }
  }
  function readOutput(chunk: Buffer) {
    outputTail = (outputTail + chunk.toString()).slice(-8000);
    const match = outputTail.match(/https:\/\/[a-z0-9]+(?:-[a-z0-9]+)*\.trycloudflare\.com/);
    if (match && !endpoint) {
      endpoint = `${match[0]}/generate`;
      console.log(JSON.stringify({ tunnelStarted: true, endpoint, at: new Date().toISOString() }));
      void register();
    }
  }
  child.stdout.on("data", readOutput);
  child.stderr.on("data", readOutput);
  const timer = setInterval(() => {
    if (Date.now() - lastSuccess > 180_000 && !registered) child.kill("SIGTERM");
    if (!registered || Date.now() - lastSuccess > 60_000) void register();
  }, 10_000);
  const shutdown = () => { stopping = true; clearInterval(timer); child.kill("SIGTERM"); };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  child.once("error", () => { clearInterval(timer); console.error("tunnel_start_failed"); process.exit(1); });
  child.once("exit", () => { clearInterval(timer); process.exit(stopping ? 0 : 1); });
}
main().catch(() => { console.error("tunnel_configuration_failed"); process.exitCode = 1; });
