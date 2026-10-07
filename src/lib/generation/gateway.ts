import { generateText, Output } from "ai";
import { generatedAssetSchema, type AssetRequest } from "@/lib/schemas";
import { PERSONALIZED_ASSET_SYSTEM_PROMPT } from "./system-prompt";

export const CONTEXT_ONLY_RULES = `
This runtime has NO browsing, screenshot, audit, or LinkedIn tools. Work only from supplied context.
Never imply you inspected a page, checked a source today, tested a user journey, or verified a company event.
When evidence is missing, create a useful proposed testing plan or worksheet, not findings. Label fictional practice companies clearly in useNote and documentLabel.
Do not fabricate a logo, domain, source URL, verified brand palette, checkedAt date, or purchased gift. Omit logoUrl unless an exact verified logo URL was supplied. Use a neutral editorial palette if no verified branding was supplied.
Only cite exact URLs provided in the input, and describe them as supplied references unless source text was supplied too. Keep sources empty if none were supplied.
Keep this compact: 3-4 substantive sections, at most 4 items per section. Each table row must have a cells array exactly as long as columns. Use plain text, not Markdown tables inside strings.
Use preparedBy for the seller, preparedFor for the prospect, and documentLabel for the type of deliverable. Do not expose universe, scores, or signal logic in recipient content.
Give each section a short navigationLabel describing its actual content. Use short titles. For a reusable template, use narrative layout and put the copyable template text in description.
`;

export async function generateWithGateway(input: AssetRequest) {
  const model = process.env.AI_GATEWAY_MODEL;
  if (!model) throw new Error("AI_GATEWAY_MODEL is not configured.");
  const result = await generateText({
    model,
    system: `${PERSONALIZED_ASSET_SYSTEM_PROMPT}\n${CONTEXT_ONLY_RULES}`,
    prompt: JSON.stringify(input),
    output: Output.object({ schema: generatedAssetSchema }),
    maxOutputTokens: 6500,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(90_000),
  });
  const asset = generatedAssetSchema.parse(result.output);
  // The writer has no source-acquisition tools. Reject invented external refs.
  const supplied = JSON.stringify(input);
  const references = [
    ...asset.sources.map((s) => s.url),
    ...asset.evidence.map((e) => e.sourceUrl),
    ...asset.sections.flatMap((s) => s.items.map((i) => i.sourceUrl)),
    asset.logoUrl,
    asset.gift.claimUrl,
  ].filter((url): url is string => Boolean(url));
  if (references.some((url) => !supplied.includes(url))) {
    throw new Error(
      "The writer returned an unsupplied source or branding URL.",
    );
  }
  return {
    asset,
    metadata: {
      model: result.response.modelId,
      responseId: result.response.id,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      researchMode: "supplied_context_only" as const,
    },
  };
}
