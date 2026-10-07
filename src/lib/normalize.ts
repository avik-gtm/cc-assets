import { assetRequestSchema, type AssetRequest } from "@/lib/schemas";

type UnknownRecord = Record<string, unknown>;

function firstString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes(".")) return `https://${value.replace(/^\/+/, "")}`;
  return undefined;
}

function normalizeDomain(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "")
    .trim();
}

function normalizeSourceUrls(value: unknown): string[] {
  const candidates = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,]/)
      : [];

  return [...new Set(candidates)]
    .map((candidate) => (typeof candidate === "string" ? normalizeUrl(candidate.trim()) : undefined))
    .filter((candidate): candidate is string => Boolean(candidate));
}

export function normalizeAssetRequest(body: unknown): AssetRequest {
  if (typeof body === "string") {
    return assetRequestSchema.parse({ prompt: body });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a prompt string or an object.");
  }

  const record = body as UnknownRecord;
  const companyDomain = normalizeDomain(
    firstString(record, ["companyDomain", "company_domain", "domain", "company_url"]),
  );

  const normalized = {
    prompt: firstString(record, ["prompt", "assetPrompt", "asset_prompt", "context"]),
    productDescription: firstString(record, [
      "productDescription",
      "product_description",
      "product",
      "seller_brief",
    ]),
    problemSolved: firstString(record, ["problemSolved", "problem_solved", "problem"]),
    universe: firstString(record, ["universe", "universe_logic", "task_1", "task1"]),
    signal: firstString(record, ["signal", "signals", "task_2", "task2"]),
    verifiedEvidence: firstString(record, [
      "verifiedEvidence",
      "verified_evidence",
      "evidence",
    ]),
    signalLogic: firstString(record, [
      "signalLogic",
      "signal_logic",
      "logic",
      "scoring_logic",
    ]),
    score: firstString(record, ["score", "company_score"]),
    scoreReasons: firstString(record, ["scoreReasons", "score_reasons", "scoring_reasons"]),
    icp: firstString(record, ["icp", "target_buyer", "persona"]),
    companyName: firstString(record, ["companyName", "company_name", "company"]),
    companyDomain,
    companyLinkedInUrl: normalizeUrl(
      firstString(record, ["companyLinkedInUrl", "company_linkedin_url", "company_linkedin"]),
    ),
    recipientName: firstString(record, [
      "recipientName",
      "recipient_name",
      "contactName",
      "contact_name",
      "person_name",
    ]),
    recipientTitle: firstString(record, [
      "recipientTitle",
      "recipient_title",
      "contactTitle",
      "contact_title",
      "person_title",
    ]),
    recipientReason: firstString(record, [
      "recipientReason",
      "recipient_reason",
      "buyer_reason",
      "task_3",
      "task3",
    ]),
    personLinkedInUrl: normalizeUrl(
      firstString(record, ["personLinkedInUrl", "person_linkedin_url", "person_linkedin"]),
    ),
    sourceUrls: normalizeSourceUrls(record.sourceUrls ?? record.source_urls ?? record.sources),
    giftPreference: firstString(record, ["giftPreference", "gift_preference", "hobby"]),
    giftSourceUrl: normalizeUrl(
      firstString(record, ["giftSourceUrl", "gift_source_url", "hobby_source_url"]),
    ),
    giftClaimUrl: normalizeUrl(
      firstString(record, ["giftClaimUrl", "gift_claim_url", "gift_url"]),
    ),
  };

  return assetRequestSchema.parse(normalized);
}

export function normalizeDomainToUrl(domain: string | undefined): string | undefined {
  return domain ? `https://${normalizeDomain(domain)}` : undefined;
}
