import { describe, expect, it } from "vitest";
import { normalizeAssetRequest } from "@/lib/normalize";

describe("normalizeAssetRequest", () => {
  it("accepts a raw prompt", () => {
    expect(
      normalizeAssetRequest("Company: Acme\nSignal: Active hiring").prompt,
    ).toContain("Acme");
  });

  it("preserves only an explicitly supplied gift offer and actual CTA destination", () => {
    const result = normalizeAssetRequest({
      prompt: "Create a six-part brief from supplied evidence.",
      approvedGiftOffer: { label: "a coffee gift card" },
      ctaUrl: "https://example.com/our-demo",
    });
    expect(result.approvedGiftOffer?.label).toBe("a coffee gift card");
    expect(result.ctaUrl).toBe("https://example.com/our-demo");
    expect(normalizeAssetRequest({ prompt: "No approved gift", giftPreference: "coffee" }).approvedGiftOffer).toBeUndefined();
  });

  it("accepts Clay-friendly aliases and normalizes URLs", () => {
    const result = normalizeAssetRequest({
      product_description: "Support operations platform",
      company_name: "Acme",
      company_url: "https://www.acme.com/",
      person_linkedin: "linkedin.com/in/jane",
      source_urls: "acme.com/careers, https://acme.com/trust",
    });

    expect(result.companyDomain).toBe("acme.com");
    expect(result.personLinkedInUrl).toBe("https://linkedin.com/in/jane");
    expect(result.sourceUrls).toEqual([
      "https://acme.com/careers",
      "https://acme.com/trust",
    ]);
  });
});
