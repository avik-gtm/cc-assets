import { describe, expect, it, vi, afterEach } from "vitest";
import { readFile } from "node:fs/promises";
import { assetRequestSchema } from "../src/lib/schemas";
import { linearSupportAsset } from "../src/lib/examples/linear-support";
import { codexArguments, codexEnvironment, finalizeCodexAsset, parseCodexResult, strictOutputSchema, withoutNulls, writeWithCodex } from "./codex";
import { isPublicAddress, pageDescription, publicSourceUrl, readableText, verifyResearchSource } from "./research";
import { runCommand } from "./claude";

vi.mock("./claude", async (importOriginal) => {
  const original = await importOriginal<typeof import("./claude")>();
  return { ...original, runCommand: vi.fn() };
});
afterEach(() => vi.resetAllMocks());

const stream = (output: unknown) => [
  { type: "thread.started", thread_id: "test" },
  { type: "item.completed", item: { type: "agent_message", text: JSON.stringify(output) } },
  { type: "turn.completed" },
].map((line) => JSON.stringify(line)).join("\n");

describe("isolated Codex subprocess configuration", () => {
  it("retains CLI auth location but removes service secrets and parent app environment", () => {
    expect(codexEnvironment({ PATH: "/bin", HOME: "/user", CODEX_HOME: "/auth", CODEX_THREAD_ID: "parent",
      ASSET_GENERATOR_TOKEN: "private", BLOB_READ_WRITE_TOKEN: "private", NODE_OPTIONS: "injection", OPENAI_API_KEY: "private" }))
      .toEqual({ PATH: "/bin", HOME: "/user", CODEX_HOME: "/auth", NODE_ENV: "production" });
  });
  it("uses ephemeral read-only execution and disables local tool/customization surfaces", () => {
    const args = codexArguments("/private/schema.json", false);
    expect(args).toContain("--ignore-user-config");
    expect(args).toContain("--ephemeral");
    expect(args).toContain("--strict-config");
    expect(args[args.indexOf("--sandbox") + 1]).toBe("read-only");
    for (const feature of ["shell_tool", "apps", "plugins", "hooks", "memories", "multi_agent", "browser_use", "computer_use", "view_image"]) {
      expect(args[args.indexOf(feature) - 1]).toBe("--disable");
    }
    expect(args).toContain('web_search="disabled"');
    expect(args).not.toContain("--dangerously-bypass-approvals-and-sandbox");
    expect(codexArguments("/schema", true, "verified-runtime-model")).toContain('web_search="live"');
  });
  it("normalizes optional fields for strict output transport without changing required ones", () => {
    expect(strictOutputSchema({ type: "object", properties: { a: { type: "string" }, b: { type: "string", default: "x" } }, required: ["a"] }))
      .toEqual({ type: "object", properties: { a: { type: "string" }, b: { anyOf: [{ type: "string" }, { type: "null" }] } }, required: ["a", "b"], additionalProperties: false });
    expect(withoutNulls({ a: null, b: [{ x: null, y: "kept" }] })).toEqual({ b: [{ y: "kept" }] });
  });
  it("accepts a completed final JSON message, not partial/error/unexpected-tool output", () => {
    expect(parseCodexResult(stream({ title: "ready" }), false)).toEqual({ title: "ready" });
    for (const value of ["not-json", '{"type":"turn.failed"}', stream({}).replace('"turn.completed"', '"turn.started"'),
      `${JSON.stringify({ type: "item.completed", item: { type: "command_execution" } })}\n${stream({})}`,
      `${JSON.stringify({ type: "item.completed", item: { type: "web_search" } })}\n${stream({})}`]) {
      expect(() => parseCodexResult(value, false)).toThrow("codex_invalid_output");
    }
    expect(parseCodexResult(`${JSON.stringify({ type: "item.completed", item: { type: "web_search" } })}\n${stream({ sources: [] })}`, true)).toEqual({ sources: [] });
  });
});

describe("public research source verification", () => {
  it.each(["127.0.0.1", "10.0.0.1", "169.254.169.254", "100.100.100.200", "172.20.0.1", "192.168.0.1", "0.0.0.0", "::1", "fe80::1", "fc00::1", "::ffff:127.0.0.1", "2001:db8::1"])("blocks private/reserved address %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
  it("allows normal public addresses", () => {
    expect(isPublicAddress("8.8.8.8")).toBe(true);
    expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
  });
  it.each(["http://example.com", "https://localhost", "https://127.0.0.1", "https://user:pass@example.com", "https://example.com:8443", "https://metadata.internal/"])("rejects unsafe source URL %s", (url) => {
    expect(() => publicSourceUrl(url)).toThrow();
  });
  it("strips script/style text and decodes common visible entities", () => {
    expect(readableText('<style>private</style><script>hidden</script><p>Teams &amp; people&nbsp;work &#116;ogether.</p>'))
      .toBe("Teams & people work together.");
  });
  it("uses publisher metadata, not navigation or scripts, for baseline company evidence", () => {
    expect(pageDescription('<nav>Home, pricing, docs, contact</nav>')).toBeUndefined();
    expect(pageDescription('<script>const fake=\'<meta name="description" content="Wrong description hidden inside code">\';</script><meta content="Software teams plan &amp; build their products." name="description">'))
      .toBe("Software teams plan & build their products.");
  });
  it("admits an exact retrieved quote and rejects invented content", async () => {
    const candidate = { url: "https://linear.app/features", title: "Linear features", quote: "Software teams plan and build their products." };
    const fetchText = vi.fn(async () => "Software teams plan and build their products. More content.");
    expect(await verifyResearchSource(candidate, new AbortController().signal, fetchText)).toMatchObject(candidate);
    expect(await verifyResearchSource({ ...candidate, quote: "This company has verified internal support problems." }, new AbortController().signal, fetchText)).toBeUndefined();
    expect(await verifyResearchSource({ ...candidate, url: "https://127.0.0.1/" }, new AbortController().signal, fetchText)).toBeUndefined();
    expect(fetchText).toHaveBeenCalledTimes(2);
  });
});

describe("parallel bounded research + single writing call", () => {
  it("starts three scoped research branches then one writer, retaining supplied evidence if research is empty", async () => {
    let active = 0; let peak = 0; let researchCalls = 0; let writerCalls = 0;
    vi.mocked(runCommand).mockImplementation(async (args, prompt, options) => {
      expect(options.env).not.toHaveProperty("ASSET_GENERATOR_TOKEN");
      const schema = JSON.parse(await readFile(args[args.indexOf("--output-schema") + 1], "utf8"));
      expect(schema.additionalProperties).toBe(false);
      if (args.includes('web_search="live"')) {
        active++; peak = Math.max(peak, active); researchCalls++;
        expect(prompt).toContain("narrowly scoped");
        await new Promise((resolve) => setTimeout(resolve, 5));
        active--;
        return { code: 0, stdout: stream({ sources: [] }) };
      }
      writerCalls++;
      expect(active).toBe(0);
      expect(prompt).toContain("EXACT SIX-PART STRUCTURE");
      return { code: 0, stdout: stream(linearSupportAsset) };
    });
    const input = assetRequestSchema.parse({ prompt: JSON.stringify(linearSupportAsset) });
    const result = await writeWithCodex(input, { executable: "codex", cwd: "/tmp", env: { PATH: "/bin", ASSET_GENERATOR_TOKEN: "private", NODE_ENV: "test" } });
    expect(peak).toBe(3); expect(researchCalls).toBe(3); expect(writerCalls).toBe(1);
    expect(result.asset.title).toBe(linearSupportAsset.title);
    expect(result.research.sources).toEqual([]);
    expect(result.research.branches.every((branch) => branch.status === "incomplete")).toBe(true);
    expect(result.asset.warnings).toContain("company research did not produce verified public evidence within the deadline; claims rely on supplied context.");
  });
  it("honors caller cancellation instead of continuing to write", async () => {
    vi.mocked(runCommand).mockRejectedValue(new Error("cancelled"));
    await expect(writeWithCodex(assetRequestSchema.parse({ prompt: "A prospect brief" }), {
      executable: "codex", cwd: "/tmp", env: { NODE_ENV: "test" }, signal: AbortSignal.abort(),
    })).rejects.toMatchObject({ code: "request_cancelled" });
  });
});

describe("deterministic safe writer finalization", () => {
  const input = assetRequestSchema.parse({ prompt: JSON.stringify(linearSupportAsset), sourceUrls: ["https://linear.app"], ctaUrl: "https://example.com/book" });
  it("orders four unique section IDs without modifying their content", () => {
    const output = structuredClone(linearSupportAsset);
    output.sections.reverse();
    const result = finalizeCodexAsset(output, input);
    expect(result.sections.map((section) => section.id)).toEqual(["current-situation", "likely-problem", "solution", "alternatives"]);
    expect(result.sections[0].items[0].description).toBe(linearSupportAsset.sections[0].items[0].description);
  });
  it("rejects duplicated or missing required sections", () => {
    const output = structuredClone(linearSupportAsset);
    output.sections[3] = structuredClone(output.sections[0]);
    expect(() => finalizeCodexAsset(output, input)).toThrow("codex_invalid_sections");
  });
  it("omits unsupported optional cosmetic and action links without inventing replacements", () => {
    const output = structuredClone(linearSupportAsset);
    output.logoUrl = "http://invented.invalid/logo.svg";
    output.callToAction = { message: "Happy to show you a sample workflow.", url: "https://invented.invalid/book" };
    const result = finalizeCodexAsset(output, input);
    expect(result.logoUrl).toBeUndefined();
    expect(result.callToAction?.url).toBeUndefined();
    expect(result.callToAction?.message).toBe(output.callToAction.message);
    expect(result.warnings).toContain("Unsupported optional logo was omitted.");
  });
  it("keeps a caller-approved CTA destination", () => {
    const output = structuredClone(linearSupportAsset);
    output.callToAction = { message: "Happy to show you a sample workflow.", url: "https://example.com/book" };
    expect(finalizeCodexAsset(output, input).callToAction?.url).toBe(input.ctaUrl);
  });
  it("rejects an invented source rather than silently stripping its citation", () => {
    const output = structuredClone(linearSupportAsset);
    output.sources.push({ label: "Invented research", url: "https://invented.invalid/research" });
    expect(() => finalizeCodexAsset(output, input)).toThrow("codex_unverified_reference");
    output.sources.pop();
    output.sections[0].items[0].sourceUrl = "https://invented.invalid/research";
    expect(() => finalizeCodexAsset(output, input)).toThrow("codex_unverified_reference");
  });
  it("normalizes only equivalent URL spelling, not a different path", () => {
    const output = structuredClone(linearSupportAsset);
    output.sources.push({ label: "Linear", url: "https://linear.app/" });
    expect(finalizeCodexAsset(output, input).sources.at(-1)?.url).toBe("https://linear.app");
    output.sources[output.sources.length - 1].url = "https://linear.app/invented-path";
    expect(() => finalizeCodexAsset(output, input)).toThrow("codex_unverified_reference");
  });
  it("renders inconsistent tables as cards using existing descriptions", () => {
    const output = structuredClone(linearSupportAsset);
    output.sections[3].columns = ["Option", "Fit"];
    output.sections[3].items[0].cells = ["Unmatched"];
    const result = finalizeCodexAsset(output, input);
    expect(result.sections[3].layout).toBe("cards");
    expect(result.sections[3].columns).toBeUndefined();
    expect(result.sections[3].items[0].description).toBe(output.sections[3].items[0].description);
  });
});
