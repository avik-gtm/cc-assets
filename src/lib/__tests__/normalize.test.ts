import { describe, expect, it } from "vitest";
import { normalizeAssetRequest } from "@/lib/normalize";

describe("normalizeAssetRequest", () => {
  it.each(["companySummary", "company_summary", "recipientCompanySummary", "prospect_company_summary"])("preserves recipient context via %s separately from seller and signals", key => {
    const result = normalizeAssetRequest({
      productDescription: "Our customer support software",
      [key]: "  The prospect sells inventory software to retailers.  ",
      signal: "Three support openings found on its careers page.",
    });
    expect(result.companySummary).toBe("The prospect sells inventory software to retailers.");
    expect(result.productDescription).toBe("Our customer support software");
    expect(result.signal).toBe("Three support openings found on its careers page.");
  });
  it("bounds company summaries and permits omitted context", () => {
    expect(() => normalizeAssetRequest({ companySummary: "x".repeat(15_001) })).toThrow();
    expect(normalizeAssetRequest({ prompt: "Create a brief" }).companySummary).toBeUndefined();
  });
  it("accepts a raw prompt", () => {
    expect(
      normalizeAssetRequest("Company: Acme\nSignal: Active hiring").prompt,
    ).toContain("Acme");
  });

  it("passes signal observations, evidence and private reasoning independently", () => {
    const result = normalizeAssetRequest({
      prompt: "Combine relevant signals with company context in Current situation.",
      signals: "Fictional practice: a second office and remote employees.",
      verified_evidence: "No public research; these are scenario inputs only.",
      signal_logic: "Coverage could matter across different employee routines.",
    });
    expect(result.signal).toBe("Fictional practice: a second office and remote employees.");
    expect(result.verifiedEvidence).toBe("No public research; these are scenario inputs only.");
    expect(result.signalLogic).toBe("Coverage could matter across different employee routines.");
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
