import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, ".env.operator.local");
let key;
try { key = parseEnv(await readFile(path, "utf8")).ASSET_OPERATOR_API_KEY; }
catch (error) { if (error.code !== "ENOENT") throw error; }
if (!key) {
  key = randomBytes(32).toString("hex");
  await writeFile(path, `ASSET_OPERATOR_API_KEY=${key}\n`, { mode: 0o600, flag: "wx" });
}
const result = spawnSync("vercel", ["env", "add", "ASSET_OPERATOR_API_KEY", "production", "--yes"], { cwd: root, input: key, encoding: "utf8" });
if (result.status !== 0) throw new Error("Could not add operator key; existing primary key was not changed.");
console.log(JSON.stringify({ added: true, privateFile: path, primaryKeyUnchanged: true }));
