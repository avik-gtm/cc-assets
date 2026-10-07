import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile, chmod, access } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

if (process.platform !== "darwin") throw new Error("This installer is for the signed-in Mac only.");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await access(join(root, ".worker-build/worker/main.js"));
const runtime = join(root, ".runtime");
await mkdir(runtime, { recursive: true, mode: 0o700 });
await chmod(runtime, 0o700);
const envPath = join(root, ".env.worker.local");
try { await access(envPath); } catch {
  await writeFile(envPath, `ASSET_GENERATOR_TOKEN=${randomBytes(32).toString("hex")}\nASSET_WRITER_MODE=codex\nASSET_CODEX_BIN=${join(dirname(process.execPath), "codex")}\nASSET_CODEX_MODEL=gpt-5.6-luna\nASSET_WORKER_HOST=127.0.0.1\nASSET_WORKER_PORT=8791\n`, { mode: 0o600, flag: "wx" });
}
await chmod(envPath, 0o600);
const label = "io.enrichflow.personalized-assets.worker";
const agents = join(homedir(), "Library/LaunchAgents");
await mkdir(agents, { recursive: true });
const plistPath = join(agents, `${label}.plist`);
const xml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
try {
  const old = await readFile(plistPath, "utf8");
  if (!old.includes(xml(root))) throw new Error("Existing launch agent belongs to another checkout.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
const args = ["/usr/bin/caffeinate", "-i", process.execPath, `--env-file=${envPath}`, join(root, ".worker-build/worker/main.js")];
const plist = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array>${args.map(arg => `<string>${xml(arg)}</string>`).join("")}</array>
<key>WorkingDirectory</key><string>${xml(root)}</string>
<key>EnvironmentVariables</key><dict><key>PATH</key><string>${xml(process.env.PATH || `${dirname(process.execPath)}:/opt/homebrew/bin:/usr/bin:/bin`)}</string><key>LANG</key><string>C.UTF-8</string><key>LC_ALL</key><string>C.UTF-8</string></dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>15</integer>
<key>StandardOutPath</key><string>${xml(join(runtime, "worker.log"))}</string>
<key>StandardErrorPath</key><string>${xml(join(runtime, "worker-error.log"))}</string>
</dict></plist>`;
await writeFile(plistPath, plist, { mode: 0o600 });
const service = `gui/${process.getuid()}/${label}`;
const existing = spawnSync("launchctl", ["print", service], { stdio: "ignore" }).status === 0;
const result = spawnSync("launchctl", existing ? ["kickstart", "-k", service] : ["bootstrap", `gui/${process.getuid()}`, plistPath], { encoding: "utf8" });
if (result.status !== 0) throw new Error(`Worker launch failed (${result.status}).`);
console.log(JSON.stringify({ installed: true, service, envFile: envPath, note: "Mac must stay online. Worker prevents idle sleep while active; lid closure or logout can stop availability." }));
