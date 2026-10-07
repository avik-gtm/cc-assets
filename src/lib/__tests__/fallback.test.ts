import { describe, expect, it } from "vitest";
import { generateFallbackAsset } from "@/lib/generation/fallback";
import { normalizeAssetRequest } from "@/lib/normalize";
import { generatedAssetSchema } from "@/lib/schemas";

describe("generateFallbackAsset", () => {
  it("routes a support brief to a report without converting hypotheses into facts", () => {
    const input = normalizeAssetRequest({
      prompt: "Product: SupportLoop coordinates customer support operations. Company: Acme. Domain: acme.com. Signal: Active sales and support openings. Signal logic: Growth may increase support complexity. Buyer: VP Customer Support.",
    });
    const asset = generatedAssetSchema.parse(generateFallbackAsset(input));

    expect(asset.assetType).toBe("report");
    expect(asset.preparedFor).toBe("Acme");
    expect(asset.sources[0]?.url).toBe("https://acme.com");
    expect(asset.evidence.some((item) => item.classification === "inference")).toBe(true);
    expect(asset.warnings).toContain("No separately labeled verified evidence was supplied.");
  });

  it("does not include a gift without a public source", () => {
    const input = normalizeAssetRequest({ company: "Acme", gift_preference: "coffee" });
    const asset = generateFallbackAsset(input);
    expect(asset.gift.status).toBe("omitted");
  });

  it("retains prompt-only LinkedIn and evidence URLs without using a homepage as claim support", () => {
    const input = normalizeAssetRequest({
      prompt: "Company: Acme. Domain: acme.com. Person LinkedIn: https://linkedin.com/in/jane. Verified evidence: Four support jobs. Source URLs: https://acme.com/careers",
    });
    const asset = generateFallbackAsset(input);
    expect(asset.personLinkedInUrl).toBe("https://linkedin.com/in/jane");
    expect(asset.evidence[0]?.sourceUrl).toBe("https://acme.com/careers");
  });
});
