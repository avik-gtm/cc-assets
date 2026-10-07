import { createHash, randomBytes } from "node:crypto";
import type { AssetRequest, AssetType } from "@/lib/schemas";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function createAssetSlug(
  input: AssetRequest,
  assetType: AssetType,
  idempotencyKey?: string | null,
  preparedFor?: string,
): string {
  const company = input.companyName || input.companyDomain || preparedFor || "prospect";
  const base = slugify(`${company}-${assetType.replace("_", "-")}`) || "prospect-asset";
  const suffix = idempotencyKey
    ? createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 8)
    : randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}
