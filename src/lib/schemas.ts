import { z } from "zod";

export const assetTypeSchema = z.enum([
  "audit",
  "map",
  "report",
  "comparison",
  "action_plan",
]);

export const evidenceClassSchema = z.enum(["fact", "inference", "unknown"]);

const optionalUrl = z.string().url().optional();

export const assetRequestSchema = z
  .object({
    prompt: z.string().trim().max(50_000).optional(),
    productDescription: z.string().trim().max(10_000).optional(),
    problemSolved: z.string().trim().max(10_000).optional(),
    universe: z.string().trim().max(10_000).optional(),
    signal: z.string().trim().max(10_000).optional(),
    verifiedEvidence: z.string().trim().max(15_000).optional(),
    signalLogic: z.string().trim().max(10_000).optional(),
    score: z.string().trim().max(2_000).optional(),
    scoreReasons: z.string().trim().max(10_000).optional(),
    icp: z.string().trim().max(5_000).optional(),
    companyName: z.string().trim().max(500).optional(),
    companyDomain: z.string().trim().max(1_000).optional(),
    companyLinkedInUrl: optionalUrl,
    recipientName: z.string().trim().max(500).optional(),
    recipientTitle: z.string().trim().max(500).optional(),
    recipientReason: z.string().trim().max(5_000).optional(),
    personLinkedInUrl: optionalUrl,
    sourceUrls: z.array(z.string().url()).max(30).default([]),
    giftPreference: z.string().trim().max(1_000).optional(),
    giftSourceUrl: optionalUrl,
    giftClaimUrl: optionalUrl,
  })
  .superRefine((value, context) => {
    const hasPrompt = Boolean(value.prompt?.trim());
    const hasStructuredContext = Boolean(
      value.productDescription ||
        value.universe ||
        value.signal ||
        value.companyDomain ||
        value.companyName,
    );

    if (!hasPrompt && !hasStructuredContext) {
      context.addIssue({
        code: "custom",
        path: ["prompt"],
        message: "Provide a prompt or at least one structured context field.",
      });
    }
  });

export const sourceSchema = z.object({
  label: z.string().min(1).max(300),
  url: z.string().url(),
});

export const evidenceSchema = z.object({
  label: z.string().min(1).max(300),
  value: z.string().min(1).max(1_000),
  detail: z.string().min(1).max(4_000),
  classification: evidenceClassSchema,
  sourceUrl: z.string().url().optional(),
});

export const sectionItemSchema = z.object({
  title: z.string().min(1).max(300),
  value: z.string().max(1_000).optional(),
  description: z.string().min(1).max(4_000),
  badge: z.string().max(100).optional(),
  classification: evidenceClassSchema.optional(),
  sourceUrl: z.string().url().optional(),
});

export const sectionSchema = z.object({
  id: z.string().min(1).max(100),
  eyebrow: z.string().max(100).optional(),
  title: z.string().min(1).max(300),
  summary: z.string().max(4_000).optional(),
  layout: z.enum(["cards", "table", "steps", "narrative"]),
  items: z.array(sectionItemSchema).min(1).max(12),
});

export const giftSchema = z.object({
  status: z.enum(["included", "suggested", "omitted"]),
  title: z.string().max(300).optional(),
  message: z.string().max(2_000).optional(),
  preference: z.string().max(1_000).optional(),
  sourceUrl: z.string().url().optional(),
  claimUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
  omissionReason: z.string().max(1_000).optional(),
});

export const generatedAssetSchema = z.object({
  assetType: assetTypeSchema,
  title: z.string().min(1).max(300),
  subtitle: z.string().min(1).max(1_000),
  preparedFor: z.string().min(1).max(500),
  recipientName: z.string().max(500).optional(),
  recipientTitle: z.string().max(500).optional(),
  companyDomain: z.string().max(1_000).optional(),
  companyLinkedInUrl: z.string().url().optional(),
  personLinkedInUrl: z.string().url().optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6d5efc"),
  executiveSummary: z.string().min(1).max(5_000),
  nonObviousInsight: z.string().min(1).max(3_000),
  evidence: z.array(evidenceSchema).min(1).max(8),
  sections: z.array(sectionSchema).min(2).max(8),
  recommendedActions: z.array(z.string().min(1).max(1_000)).min(1).max(6),
  sources: z.array(sourceSchema).max(30),
  gift: giftSchema,
  task5Hook: z.string().min(1).max(2_000),
  warnings: z.array(z.string().max(1_000)).max(20).default([]),
});

export const assetDocumentSchema = generatedAssetSchema.extend({
  slug: z.string().min(1).max(180),
  generatedAt: z.string().datetime(),
  generationMode: z.enum(["fallback", "agent"]),
});

export type AssetRequest = z.infer<typeof assetRequestSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
export type AssetDocument = z.infer<typeof assetDocumentSchema>;
export type AssetSection = z.infer<typeof sectionSchema>;
