import { z } from "zod";
import { generatedAssetSchema } from "../schemas";

// Only accepted from the authenticated worker, after its deterministic source
// retrieval and quotation checks. Never accepted as caller-supplied evidence.
export const researchedGenerationSchema = z.object({
  asset: generatedAssetSchema,
  research: z.object({
    sources: z.array(z.object({
      url: z.string().url().startsWith("https://").max(3000),
      title: z.string().max(1000),
      quote: z.string().max(3000),
      checkedAt: z.string().date(),
    }).strict()).max(20),
    branches: z.array(z.object({
      name: z.enum(["company", "problem", "buyer"]),
      status: z.enum(["complete", "incomplete"]),
    }).strict()).max(3),
    durationMs: z.number().nonnegative(),
  }).strict(),
}).strict();

export type ResearchedGeneration = z.infer<typeof researchedGenerationSchema>;
