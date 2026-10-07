import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

if (process.platform !== "darwin") throw new Error("This installer is for the signed-in Mac only.");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const path of [".worker-build/worker/tunnel.js", ".env.worker.local", ".env.local"]) await access(join(root, path));
await access("/opt/homebrew/bin/cloudflared");
const runtime = join(root, ".runtime");
await mkdir(runtime, { recursive: true, mode: 0o700 });
const label = "io.enrichflow.personalized-assets.tunnel";
const agents = join(homedir(), "Library/LaunchAgents");
await mkdir(agents, { recursive: true });
const plistPath = join(agents, `${label}.plist`);
const xml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
try {
  if (!(await readFile(plistPath, "utf8")).includes(xml(root))) throw new Error("Launch agent belongs to another checkout.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
const args = [process.execPath, join(root, ".worker-build/worker/tunnel.js")];
await writeFile(plistPath, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array>${args.map(arg => `<string>${xml(arg)}</string>`).join("")}</array>
<key>WorkingDirectory</key><string>${xml(root)}</string>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>15</integer><key>ExitTimeOut</key><integer>15</integer>
<key>StandardOutPath</key><string>${xml(join(runtime, "tunnel.log"))}</string>
<key>StandardErrorPath</key><string>${xml(join(runtime, "tunnel-error.log"))}</string>
</dict></plist>`, { mode: 0o600 });
const service = `gui/${process.getuid()}/${label}`;
const loaded = spawnSync("launchctl", ["print", service], { stdio: "ignore" }).status === 0;
const result = spawnSync("launchctl", loaded ? ["kickstart", "-k", service] : ["bootstrap", `gui/${process.getuid()}`, plistPath], { stdio: "ignore" });
if (result.status !== 0) throw new Error("Tunnel launch failed.");
console.log(JSON.stringify({ installed: true, service, note: "Independent of the desktop app. Mac must remain signed in, awake and online." }));
