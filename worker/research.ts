import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";
import { z } from "zod";

export const researchSourceSchema = z.object({
  url: z.string().url().refine((value) => value.startsWith("https://")),
  title: z.string().min(1).max(200),
  quote: z.string().min(20).max(280),
  checkedAt: z.string().date(),
});
export const researchSchema = z.object({
  brand: z.object({ logoUrl: z.string().url().startsWith("https://"), sourceUrl: z.string().url().startsWith("https://"), kind: z.enum(["logo", "icon"]) }).optional(),
  sources: z.array(researchSourceSchema).max(6),
  branches: z.array(z.object({
    name: z.enum(["company", "problem", "buyer"]),
    status: z.enum(["complete", "incomplete"]),
  })).max(3),
  durationMs: z.number().nonnegative(),
});
export type Research = z.infer<typeof researchSchema>;
export type ResearchSource = z.infer<typeof researchSourceSchema>;

// Fetch only public HTTPS pages. Resolve all answers first and pin the validated
// address into the socket lookup so a second DNS answer cannot rebind to a LAN.
export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) || (a === 203 && b === 0));
  }
  // Restrict IPv6 to global-unicast space, excluding documentation ranges.
  return version === 6 && /^[23][0-9a-f]{0,3}:/i.test(address) &&
    !/^2001:(?:db8|0|10|20):/i.test(address);
}

export function publicSourceUrl(raw: string): URL {
  const url = new URL(raw);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (url.protocol !== "https:" || url.username || url.password ||
    (url.port && url.port !== "443") || !host.includes(".") ||
    /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host) ||
    (isIP(host) && !isPublicAddress(host))) throw new Error("source_not_public");
  return url;
}

export function readableText(html: string): string {
  return html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&#(\d+);/g, (_match, value) => {
      const code = Number(value); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    }).replace(/&#x([a-f\d]+);/gi, (_match, value) => {
      const code = parseInt(value, 16); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    }).replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, (entity) => ({
      "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">",
    })[entity] || " ").replace(/\s+/g, " ").trim();
}

export function pageDescription(html: string): string | undefined {
  const markup = html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
  for (const tag of markup.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((match) => [match[1].toLowerCase(), match[2] ?? match[3]]));
    if (["description", "og:description"].includes((attributes.name || attributes.property || "").toLowerCase())) {
      const text = readableText(attributes.content || "");
      if (text.length >= 20) return text;
    }
  }
  return undefined;
}

async function fetchPublicHtml(raw: string, signal: AbortSignal, redirects = 0, image = false): Promise<string> {
  if (signal.aborted) throw new Error("source_timeout");
  const url = publicSourceUrl(raw);
  const answers = await Promise.race([
    lookup(url.hostname, { all: true }),
    new Promise<never>((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("source_timeout")), { once: true });
    }),
  ]);
  if (!answers.length || answers.some((answer) => !isPublicAddress(answer.address))) throw new Error("source_not_public");
  return new Promise<string>((resolve, reject) => {
    const req = request(url, {
      signal, method: "GET", headers: { "User-Agent": "EnrichFlow-Asset-Research/1.0", Accept: "text/html,text/plain", "Accept-Encoding": "identity" },
      lookup: ((_hostname: string, options: unknown, callback: (...args: unknown[]) => void) => {
        if (options && typeof options === "object" && "all" in options && options.all) callback(null, answers);
        else callback(null, answers[0].address, answers[0].family);
      }) as never,
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 2) {
        res.resume();
        fetchPublicHtml(new URL(res.headers.location, url).href, signal, redirects + 1, image).then(resolve, reject);
        return;
      }
      const accepted = image ? /^image\/(?:png|jpeg|webp|svg\+xml|x-icon|vnd.microsoft.icon|gif)\b/i : /^(?:text\/html|text\/plain|application\/xhtml\+xml)\b/i;
      if (res.statusCode !== 200 || !accepted.test(String(res.headers["content-type"]))) {
        res.resume(); reject(new Error("source_unavailable")); return;
      }
      const chunks: Buffer[] = []; let size = 0;
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > 1_500_000) req.destroy(new Error("source_too_large"));
        else chunks.push(chunk);
      });
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", reject); req.end();
  });
}

/** Use branding explicitly published by the company, not model-guessed URLs or
 * arbitrary social-preview images. Icons are a fallback, not a verified wordmark. */
export function brandCandidates(html: string, origin: string): { logoUrl: string; kind: "logo" | "icon" }[] {
  const candidates: { logoUrl: string; kind: "logo" | "icon" }[] = [];
  const add = (value: unknown, kind: "logo" | "icon") => {
    if (typeof value !== "string" || !value) return;
    try { candidates.push({ logoUrl: publicSourceUrl(new URL(value.replaceAll("&amp;", "&"), origin).href).href, kind }); } catch { /* reject unsafe assets */ }
  };
  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const walk = (value: unknown, depth = 0) => {
      if (!value || typeof value !== "object" || depth > 8) return;
      if (Array.isArray(value)) { value.forEach(v => walk(v, depth + 1)); return; }
      const obj = value as Record<string, unknown>;
      if (/Organization|Corporation|Brand/.test(String(obj["@type"]))) {
        const logo = obj.logo;
        add(typeof logo === "object" && logo ? (logo as Record<string, unknown>).url : logo, "logo");
      }
      if (obj["@graph"]) walk(obj["@graph"], depth + 1);
    };
    try { walk(JSON.parse(script[1])); } catch { /* malformed metadata */ }
  }
  const markup = html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
  const companyToken = new URL(origin).hostname.replace(/^www\./, "").split(".")[0].toLowerCase();
  for (const tag of markup.match(/<(?:img|link)\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
    const identity = (attrs.alt || "").toLowerCase();
    if (/^<img/i.test(tag) && /logo|wordmark/i.test([attrs.alt, attrs.class, attrs.id].join(" ")) &&
      (identity.includes(companyToken) || /^(?:company |brand )?(?:logo|wordmark)$/.test(identity)) &&
      !/customer|partner|client/i.test([attrs.alt, attrs.class, attrs.id].join(" "))) add(attrs.src, "logo");
    if (/^<link/i.test(tag) && /^(?:apple-touch-icon|icon|shortcut icon)$/i.test(attrs.rel || "")) add(attrs.href, "icon");
  }
  return [...new Map(candidates.sort((a, b) => Number(a.kind === "icon") - Number(b.kind === "icon")).map(c => [c.logoUrl, c])).values()].slice(0, 4);
}

export async function discoverCompanyBrand(origin: string, signal: AbortSignal): Promise<Research["brand"]> {
  try {
    const candidates = brandCandidates(await fetchPublicHtml(origin, signal), origin);
    for (const candidate of candidates) {
      try {
        await fetchPublicHtml(candidate.logoUrl, signal, 0, true);
        return { ...candidate, sourceUrl: origin };
      } catch { if (signal.aborted) break; }
    }
  } catch { /* optional discovery must never block generation */ }
  return undefined;
}

export async function fetchPublicText(raw: string, signal: AbortSignal): Promise<string> {
  const html = await fetchPublicHtml(raw, signal);
  return [pageDescription(html), readableText(html)].filter(Boolean).join(" ");
}

/** Deterministic baseline evidence while research agents warm up. Use a real
 * publisher description, never arbitrary navigation or a guessed paragraph. */
export async function fetchCompanySeed(url: string, signal: AbortSignal): Promise<ResearchSource | undefined> {
  try {
    const html = await fetchPublicHtml(url, signal);
    const description = pageDescription(html);
    if (!description) return undefined;
    const clipped = description.length > 280 ? description.slice(0, 280).replace(/\s+\S*$/, "") : description;
    const title = readableText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || new URL(url).hostname).slice(0, 200);
    return researchSourceSchema.parse({ url, title, quote: clipped, checkedAt: new Date().toISOString().slice(0, 10) });
  } catch { return undefined; }
}

// The model's search result is a candidate, not evidence. Only an exact quote
// found in a separately retrieved public page is admitted to the writing input.
export async function verifyResearchSource(
  candidate: { url: string; title: string; quote: string }, signal: AbortSignal,
  fetchText = fetchPublicText,
): Promise<ResearchSource | undefined> {
  try {
    publicSourceUrl(candidate.url);
    const text = await fetchText(candidate.url, signal);
    const quote = readableText(candidate.quote);
    if (quote.length < 20 || quote.length > 280 || !text.toLowerCase().includes(quote.toLowerCase())) return undefined;
    return researchSourceSchema.parse({ ...candidate, quote, checkedAt: new Date().toISOString().slice(0, 10) });
  } catch { return undefined; }
}
