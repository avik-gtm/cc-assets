import { z } from "zod";

export const assetTypeSchema = z.enum([
  "audit",
  "map",
  "report",
  "comparison",
  "action_plan",
  "toolkit",
]);

export const evidenceClassSchema = z.enum(["fact", "inference", "unknown"]);

export const safeUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https:\/\//i.test(value), "Use an HTTPS URL.");
const optionalUrl = safeUrlSchema.optional();
const logoUrlSchema = z.union([
  z.string().regex(/^\/brands\/[a-z0-9.-]+\.(svg|png|webp)$/i),
  safeUrlSchema,
]);

export const assetRequestSchema = z
  .object({
    prompt: z.string().trim().max(50_000).optional(),
    example: z.enum(["linear-support", "lifecore-wellness"]).optional(),
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
    companySummary: z.string().trim().max(15_000).optional(),
    companyDomain: z.string().trim().max(1_000).optional(),
    logoUrl: optionalUrl,
    companyLinkedInUrl: optionalUrl,
    recipientName: z.string().trim().max(500).optional(),
    recipientTitle: z.string().trim().max(500).optional(),
    recipientReason: z.string().trim().max(5_000).optional(),
    personLinkedInUrl: optionalUrl,
    sourceUrls: z.array(safeUrlSchema).max(30).default([]),
    giftPreference: z.string().trim().max(1_000).optional(),
    giftSourceUrl: optionalUrl,
    giftClaimUrl: optionalUrl,
    approvedGiftOffer: z
      .object({
        label: z.string().trim().min(1).max(300),
        policyNote: z.string().trim().max(500).optional(),
      })
      .optional(),
    ctaUrl: optionalUrl,
  })
  .superRefine((value, context) => {
    const hasPrompt = Boolean(value.prompt?.trim());
    const hasStructuredContext = Boolean(
      value.productDescription ||
        value.universe ||
        value.signal ||
        value.companyDomain ||
        value.companyName || value.companySummary,
    );

    if (!hasPrompt && !hasStructuredContext && !value.example) {
      context.addIssue({
        code: "custom",
        path: ["prompt"],
        message: "Provide a prompt or at least one structured context field.",
      });
    }
  });

export const sourceSchema = z.object({
  label: z.string().min(1).max(300),
  url: safeUrlSchema,
  note: z.string().max(1000).optional(),
  checkedAt: z.string().date().optional(),
});

export const evidenceSchema = z.object({
  label: z.string().min(1).max(300),
  value: z.string().min(1).max(1_000),
  detail: z.string().min(1).max(4_000),
  classification: evidenceClassSchema,
  sourceUrl: optionalUrl,
});

export const sectionItemSchema = z.object({
  title: z.string().min(1).max(300),
  value: z.string().max(1_000).optional(),
  description: z.string().min(1).max(4_000),
  badge: z.string().max(100).optional(),
  classification: evidenceClassSchema.optional(),
  sourceUrl: optionalUrl,
  usage: z.string().max(1000).optional(),
  procedure: z
    .array(
      z.object({
        label: z.string().min(1).max(160),
        instruction: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(8)
    .optional(),
  checks: z.array(z.string().max(1000)).max(8).optional(),
  cells: z.array(z.string().max(2000)).max(6).optional(),
});

export const sectionSchema = z
  .object({
    id: z.string().min(1).max(100),
    eyebrow: z.string().max(100).optional(),
    title: z.string().min(1).max(300),
    navigationLabel: z.string().max(32).optional(),
    summary: z.string().max(4_000).optional(),
    layout: z.enum([
      "cards",
      "table",
      "steps",
      "narrative",
      "replies",
      "checklist",
    ]),
    columns: z.array(z.string().max(100)).max(6).optional(),
    defaultOpen: z.boolean().optional(),
    items: z.array(sectionItemSchema).min(1).max(12),
  })
  .superRefine((section, context) => {
    if (
      section.columns &&
      section.items.some(
        (item) => item.cells?.length !== section.columns?.length,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Each table row must match the column count.",
      });
    }
  });

export const giftSchema = z.object({
  status: z.enum(["included", "suggested", "omitted"]),
  title: z.string().max(300).optional(),
  message: z.string().max(2_000).optional(),
  preference: z.string().max(1_000).optional(),
  sourceUrl: optionalUrl,
  claimUrl: optionalUrl,
  confidence: z.number().min(0).max(1).optional(),
  omissionReason: z.string().max(1_000).optional(),
});

export const generatedAssetSchema = z.object({
  documentFormat: z.literal("six_part_brief").optional(),
  assetType: assetTypeSchema,
  title: z.string().min(1).max(300),
  subtitle: z.string().min(1).max(1_000),
  preparedFor: z.string().min(1).max(500),
  recipientName: z.string().max(500).optional(),
  recipientTitle: z.string().max(500).optional(),
  companyDomain: z.string().max(1_000).optional(),
  companyLinkedInUrl: optionalUrl,
  personLinkedInUrl: optionalUrl,
  logoUrl: logoUrlSchema.optional(),
  brandBackground: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  brandSurface: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  preparedBy: z.string().max(200).optional(),
  documentLabel: z.string().max(100).optional(),
  useNote: z.string().max(2000).optional(),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6d5efc"),
  executiveSummary: z.string().min(1).max(5_000),
  nonObviousInsight: z.string().min(1).max(3_000),
  evidence: z.array(evidenceSchema).max(8),
  sections: z.array(sectionSchema).min(2).max(8),
  recommendedActions: z.array(z.string().min(1).max(1_000)).min(1).max(6),
  sources: z.array(sourceSchema).max(30),
  gift: giftSchema,
  task5Hook: z.string().min(1).max(2_000),
  callToAction: z
    .object({
      message: z.string().min(1).max(1500),
      buttonLabel: z.string().max(100).optional(),
      url: optionalUrl,
    })
    .optional(),
  approvedGiftOffer: z
    .object({
      label: z.string().min(1).max(300),
      policyNote: z.string().max(500).optional(),
    })
    .optional(),
  warnings: z.array(z.string().max(1_000)).max(20).default([]),
});

export const assetDocumentSchema = generatedAssetSchema.extend({
  slug: z.string().min(1).max(180),
  generatedAt: z.string().datetime(),
  generationMode: z.enum(["fallback", "agent", "reference"]),
});

export type AssetRequest = z.infer<typeof assetRequestSchema>;
export type AssetType = z.infer<typeof assetTypeSchema>;
export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
export type AssetDocument = z.infer<typeof assetDocumentSchema>;
export type AssetSection = z.infer<typeof sectionSchema>;
