import { readFile, mkdir, writeFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try { loadEnvFile(join(root, ".env.local")); } catch { /* explicit environment works too */ }
try { loadEnvFile(join(root, ".env.operator.local")); } catch { /* existing caller key works too */ }
const file = process.argv[2];
if (!file) throw new Error("Usage: npm run asset:generate -- /path/to/request.json");
const key = process.env.ASSET_OPERATOR_API_KEY || process.env.ASSET_API_KEY;
if (!key) throw new Error("Private caller key is missing from .env.operator.local or .env.local.");
const input = JSON.parse(await readFile(resolve(file), "utf8"));
if (input.example) throw new Error("Remove example for real generation; authored examples do not test the model.");
const endpoint = process.env.ASSET_PUBLIC_API_URL || "https://cc.getattn.io/api/assets";
const url = new URL(endpoint);
if (url.protocol !== "https:" || url.username || url.password) throw new Error("API URL must use HTTPS.");
const response = await fetch(endpoint, {
  method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify(input), signal: AbortSignal.timeout(110_000), redirect: "error",
});
const result = await response.json();
await mkdir(join(root, ".runtime"), { recursive: true, mode: 0o700 });
await writeFile(join(root, ".runtime/last-result.json"), JSON.stringify(result, null, 2), { mode: 0o600 });
console.log(JSON.stringify(result, null, 2));
if (!response.ok || !result.success) process.exitCode = 1;
