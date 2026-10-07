// Explicit operator-run load test. Uses real generation, never authored examples.
import { loadEnvFile } from "node:process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parseEnv } from "node:util";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env.operator.local"]) {
  try { loadEnvFile(join(root, file)); } catch { /* explicit environment accepted */ }
}
if (!process.argv[2]) throw new Error("Provide one request JSON file. This test sends 10 real simultaneous requests.");
const input = JSON.parse(await readFile(resolve(process.argv[2]), "utf8"));
if (input.example) throw new Error("Authored references cannot test generator concurrency.");
const key = process.env.ASSET_OPERATOR_API_KEY || process.env.ASSET_API_KEY;
if (!key) throw new Error("Missing caller key.");
const workerEnv = parseEnv(await readFile(join(root, ".env.worker.local"), "utf8"));
let peakActive = 0;
let polling = false;
const poll = async () => {
  if (polling) return;
  polling = true;
  try {
    const r = await fetch(`http://127.0.0.1:${workerEnv.ASSET_WORKER_PORT || "8791"}/health`, {
      headers: { Authorization: `Bearer ${workerEnv.ASSET_GENERATOR_TOKEN}` }, signal: AbortSignal.timeout(2000),
    });
    const health = await r.json();
    if (r.ok) peakActive = Math.max(peakActive, health.active || 0);
  } catch { /* report observed capacity only */ } finally { polling = false; }
};
const started = performance.now();
const timer = setInterval(poll, 1000);
let results;
try {
  results = await Promise.all(Array.from({ length: 10 }, async (_, index) => {
    try {
      const r = await fetch("https://cc.getattn.io/api/assets", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(input), signal: AbortSignal.timeout(110_000), redirect: "error",
      });
      const body = await r.json();
      const contractValid = Object.keys(body).sort().join() === "assetUrl,executionTimeMs,success";
      return { request: index + 1, status: r.status, contractValid, ...body };
    } catch (error) { return { request: index + 1, success: false, error: error.name }; }
  }));
} finally { clearInterval(timer); }
const elapsedSeconds = Math.round((performance.now() - started) / 100) / 10;
const successful = results.filter(row => row.success && row.status === 200 && row.contractValid);
const published = await Promise.all(successful.map(async row => {
  try { return (await fetch(row.assetUrl, { signal: AbortSignal.timeout(10_000) })).status === 200; } catch { return false; }
}));
const report = { requests: 10, succeeded: successful.length, peakActive, elapsedSeconds,
  uniqueUrls: new Set(successful.map(row => row.assetUrl)).size,
  publishedPages: published.filter(Boolean).length, results };
await mkdir(join(root, ".runtime"), { recursive: true, mode: 0o700 });
await writeFile(join(root, ".runtime/concurrency-result.json"), JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(JSON.stringify(report, null, 2));
if (report.succeeded !== 10 || report.peakActive !== 10 || report.uniqueUrls !== 10 || report.publishedPages !== 10) process.exitCode = 1;
