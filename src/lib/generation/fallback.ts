import type { AssetRequest, AssetType, GeneratedAsset } from "@/lib/schemas";
import { normalizeDomainToUrl } from "@/lib/normalize";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const promptLabels = [
  "Product",
  "Product description",
  "Problem solved",
  "Problem",
  "Universe",
  "Task 1",
  "Universe and why this company qualified",
  "Signal",
  "Task 2",
  "Verified evidence",
  "Evidence",
  "Signal logic or hypothesis",
  "Signal logic",
  "Hypothesis",
  "Score reasons",
  "Scoring reasons",
  "Score",
  "ICP",
  "Selected buyer",
  "Buyer",
  "Company domain",
  "Domain",
  "Company LinkedIn",
  "Prospect company",
  "Company",
  "Recipient",
  "Person",
  "Person LinkedIn",
  "Why this buyer owns the problem",
  "Buyer reason",
  "Gift preference",
  "Hobby",
  "Gift source URL",
  "Source URLs",
];

function promptField(
  prompt: string | undefined,
  labels: string[],
): string | undefined {
  if (!prompt) return undefined;
  const pattern = labels.map(escapeRegex).join("|");
  const nextLabelPattern = promptLabels.map(escapeRegex).join("|");
  const match = prompt.match(
    new RegExp(
      `(?:^|[\\n;]|\\.\\s+)\\s*(?:${pattern})\\s*:\\s*(.+?)(?=\\n|;|\\.\\s+(?:${nextLabelPattern})\\s*:|$)`,
      "i",
    ),
  );
  return match?.[1]?.trim();
}

function companyFromDomain(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  const first = domain.replace(/^www\./, "").split(".")[0];
  return first
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractDomain(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(
    /(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i,
  );
  return match?.[1]?.toLowerCase();
}

function extractUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/https?:\/\/[^\s,]+/i);
  return match?.[0]?.replace(/[.)]+$/, "");
}

function extractUrls(value: string | undefined): string[] {
  return (
    value
      ?.match(/https?:\/\/[^\s,]+/gi)
      ?.map((url) => url.replace(/[.)]+$/, "")) || []
  );
}

function inferAssetType(text: string): AssetType {
  if (/competitor|alternative|versus|compare|comparison|stack/i.test(text))
    return "comparison";
  if (
    /partner|ecosystem|account map|stakeholder|territor|prospect list/i.test(
      text,
    )
  )
    return "map";
  if (/compliance|accessibility|risk|audit|gap|readiness|security/i.test(text))
    return "audit";
  if (
    /hiring|capacity|growth|support|operations|market analysis|report/i.test(
      text,
    )
  )
    return "report";
  return "action_plan";
}

function inferTopic(text: string): string {
  if (
    /customer support|support operations|customer experience|escalation|knowledge/i.test(
      text,
    )
  ) {
    return "Customer Support Growth";
  }
  if (/accessibility|wcag|digital access/i.test(text))
    return "Accessibility Readiness";
  if (/compliance|soc 2|iso 27001|hipaa|gdpr|security monitoring/i.test(text)) {
    return "Enterprise Compliance";
  }
  if (/partner|ecosystem|alliances|channel/i.test(text))
    return "Partner Ecosystem";
  if (/recruit|hiring|talent|ats/i.test(text)) return "Hiring Capacity";
  if (/competitor|competitive/i.test(text)) return "Competitive Position";
  return "Opportunity";
}

function titleFor(
  company: string,
  topic: string,
  assetType: AssetType,
): string {
  switch (assetType) {
    case "audit":
      return `${company} ${topic} Audit`;
    case "map":
      return `${company} ${topic} Map`;
    case "report":
      return `${company} ${topic} Brief`;
    case "comparison":
      return `${company} ${topic} Comparison`;
    default:
      return `${company} ${topic} Action Plan`;
  }
}

function decisionLens(topic: string) {
  if (topic === "Customer Support Growth") {
    return [
      {
        title: "Demand entering the system",
        description:
          "Review whether commercial growth signals are likely to increase the number, variety, or complexity of customer conversations.",
      },
      {
        title: "Operating consistency",
        description:
          "Check whether QA, escalation ownership, and support onboarding can remain consistent as the team changes.",
      },
      {
        title: "Knowledge coverage",
        description:
          "Identify the workflows or product areas where new customers and new support hires create the greatest knowledge burden.",
      },
    ];
  }

  if (
    topic === "Enterprise Compliance" ||
    topic === "Accessibility Readiness"
  ) {
    return [
      {
        title: "Current exposure",
        description:
          "Separate verified obligations and visible gaps from assumptions that still require validation.",
      },
      {
        title: "Change pressure",
        description:
          "Identify which expansion, customer, hiring, or regulatory event increases the cost of waiting.",
      },
      {
        title: "Practical remediation",
        description:
          "Prioritize the smallest set of actions that improves readiness without creating a broad transformation project.",
      },
    ];
  }

  return [
    {
      title: "Verified current state",
      description:
        "Anchor the decision in supplied company evidence rather than broad industry assumptions.",
    },
    {
      title: "What changed",
      description:
        "Connect the strongest current signal to the operational outcome the selected buyer owns.",
    },
    {
      title: "Useful next decision",
      description:
        "Turn the evidence into a concrete action or question the recipient can use immediately.",
    },
  ];
}

const sensitiveGiftPattern =
  /religion|politic|medical|health condition|sexual|pregnan|child|family status|home address/i;

export function generateFallbackAsset(input: AssetRequest): GeneratedAsset {
  const prompt = input.prompt;
  const product =
    input.productDescription ||
    promptField(prompt, ["Product", "Product description"]) ||
    "the seller's product";
  const problem =
    input.problemSolved ||
    promptField(prompt, ["Problem solved", "Problem"]) ||
    "the operational problem described in the brief";
  const universe =
    input.universe ||
    promptField(prompt, [
      "Universe",
      "Task 1",
      "Universe and why this company qualified",
    ]);
  const signal = input.signal || promptField(prompt, ["Signal", "Task 2"]);
  const verifiedEvidence =
    input.verifiedEvidence ||
    promptField(prompt, ["Verified evidence", "Evidence"]);
  const signalLogic =
    input.signalLogic ||
    promptField(prompt, [
      "Signal logic or hypothesis",
      "Signal logic",
      "Hypothesis",
    ]);
  const score = input.score || promptField(prompt, ["Score"]);
  const scoreReasons =
    input.scoreReasons ||
    promptField(prompt, ["Score reasons", "Scoring reasons"]);
  const icp =
    input.icp || promptField(prompt, ["ICP", "Selected buyer", "Buyer"]);
  const domain =
    input.companyDomain ||
    extractDomain(promptField(prompt, ["Company domain", "Domain"]));
  const companyLinkedInUrl =
    input.companyLinkedInUrl ||
    extractUrl(promptField(prompt, ["Company LinkedIn"]));
  const personLinkedInUrl =
    input.personLinkedInUrl ||
    extractUrl(promptField(prompt, ["Person LinkedIn"]));
  const company =
    input.companyName ||
    promptField(prompt, ["Prospect company", "Company"]) ||
    companyFromDomain(domain) ||
    "Prospect";
  const recipientName =
    input.recipientName || promptField(prompt, ["Recipient", "Person"]);
  const recipientTitle = input.recipientTitle || icp;
  const recipientReason =
    input.recipientReason ||
    promptField(prompt, ["Why this buyer owns the problem", "Buyer reason"]);

  const fullText = [
    product,
    problem,
    universe,
    signal,
    signalLogic,
    icp,
    prompt,
  ]
    .filter(Boolean)
    .join(" ");
  const assetType = inferAssetType(fullText);
  const topic = inferTopic(fullText);
  const title = titleFor(company, topic, assetType);
  const companyUrl = normalizeDomainToUrl(domain);
  const suppliedSourceUrls = [
    ...input.sourceUrls,
    ...extractUrls(promptField(prompt, ["Source URLs"])),
  ];
  const sourceUrls = [
    ...suppliedSourceUrls,
    ...(companyUrl ? [companyUrl] : []),
  ];
  const uniqueSources = [...new Set(sourceUrls)];
  const evidenceSource = suppliedSourceUrls[0];

  const evidence: GeneratedAsset["evidence"] = [];
  if (verifiedEvidence) {
    evidence.push({
      label: "Verified evidence",
      value: "Observed",
      detail: verifiedEvidence,
      classification: "fact",
      sourceUrl: evidenceSource,
    });
  }
  if (signal) {
    evidence.push({
      label: "Current signal",
      value: "Why now",
      detail: signal,
      classification: verifiedEvidence ? "fact" : "inference",
      sourceUrl: evidenceSource,
    });
  }
  if (universe) {
    evidence.push({
      label: "Qualification context",
      value: "Why this company",
      detail: universe,
      classification: "inference",
    });
  }
  if (signalLogic) {
    evidence.push({
      label: "Working hypothesis",
      value: "What the data may suggest",
      detail: signalLogic,
      classification: "inference",
    });
  }
  if (score || scoreReasons) {
    evidence.push({
      label: "Priority score",
      value: score || "Scored",
      detail:
        scoreReasons || "A score was supplied without its component reasons.",
      classification: "inference",
    });
  }
  if (evidence.length === 0) {
    evidence.push({
      label: "Available context",
      value: "Requires validation",
      detail:
        "The request did not include claim-level evidence, so this brief stays intentionally directional.",
      classification: "unknown",
    });
  }

  const giftPreference =
    input.giftPreference || promptField(prompt, ["Gift preference", "Hobby"]);
  const giftSourceUrl =
    input.giftSourceUrl || extractUrl(promptField(prompt, ["Gift source URL"]));
  const giftIsSafe = Boolean(
    giftPreference &&
    giftSourceUrl &&
    !sensitiveGiftPattern.test(giftPreference),
  );

  const sourceObjects = uniqueSources.map((url, index) => ({
    label: index === 0 ? `${company} source` : `Supporting source ${index + 1}`,
    url,
  }));

  const warnings = [
    "Generated with the deterministic fallback; connect an approved agent service for deeper research and writing.",
  ];
  if (!verifiedEvidence)
    warnings.push("No separately labeled verified evidence was supplied.");
  if (personLinkedInUrl) {
    warnings.push(
      "The supplied LinkedIn URL was retained as a research seed, not treated as verified evidence.",
    );
  }

  return {
    assetType,
    title,
    subtitle: `An evidence-conscious ${assetType.replace("_", " ")} prepared around ${problem}.`,
    preparedFor: company,
    recipientName,
    recipientTitle,
    companyDomain: domain,
    companyLinkedInUrl,
    personLinkedInUrl,
    brandColor: "#6d5efc",
    executiveSummary: `${company} matched the supplied universe and surfaced a current signal connected to ${topic.toLowerCase()}. This brief turns that evidence into a practical decision lens for ${recipientTitle || "the relevant owner"} without assuming the underlying operation is failing.`,
    nonObviousInsight: `The useful question is not simply whether ${company} shows the signal. It is whether the operating system around ${topic.toLowerCase()} is changing at the same pace as the conditions that produced it.`,
    evidence,
    sections: [
      {
        id: "why-now",
        eyebrow: "Signal to decision",
        title: "Why this deserves attention now",
        summary:
          "The signal is useful only when its implication is separated from what remains unverified.",
        layout: "cards",
        items: [
          {
            title: "Observed condition",
            value: signal ? "Current signal" : "Evidence needed",
            description: signal || "No explicit current signal was supplied.",
            classification: signal && verifiedEvidence ? "fact" : "unknown",
            sourceUrl: evidenceSource,
          },
          {
            title: "Interpretation",
            value: "Working hypothesis",
            description:
              signalLogic ||
              "The operational implication must be validated with the selected buyer.",
            classification: "inference",
          },
          {
            title: "Buyer ownership",
            value: recipientTitle || "Role to confirm",
            description:
              recipientReason ||
              `This person should own or influence the outcome connected to ${topic.toLowerCase()}.`,
            classification: recipientTitle ? "fact" : "unknown",
          },
        ],
      },
      {
        id: "decision-lens",
        eyebrow: "Useful framework",
        title: `A practical ${topic.toLowerCase()} decision lens`,
        summary:
          "Three areas worth checking before turning the signal into a larger initiative.",
        layout: "steps",
        items: decisionLens(topic).map((item, index) => ({
          ...item,
          value: `0${index + 1}`,
          classification: "inference" as const,
        })),
      },
      {
        id: "product-fit",
        eyebrow: "Connection to the product",
        title: "Where the product could become relevant",
        summary:
          "Product relevance should follow the evidence rather than lead it.",
        layout: "narrative",
        items: [
          {
            title: "Product capability",
            description: product,
            classification: "fact",
          },
          {
            title: "Fit hypothesis",
            description: `${product} may be relevant when ${problem.toLowerCase()} becomes materially harder for ${company}.`,
            classification: "inference",
          },
          {
            title: "Validation question",
            description: `Which part of ${topic.toLowerCase()} is becoming harder to keep consistent as the current signal develops?`,
            classification: "inference",
          },
        ],
      },
    ],
    recommendedActions: [
      `Validate the working hypothesis with ${recipientTitle || "the operational owner"} before treating it as a confirmed problem.`,
      `Review the process, capacity, or controls most directly affected by the current signal.`,
      `Choose one measurable next step rather than launching a broad transformation project.`,
    ],
    sources: sourceObjects,
    gift: giftIsSafe
      ? {
          status: input.giftClaimUrl ? "included" : "suggested",
          title: `A thoughtful extra for ${recipientName || "the recipient"}`,
          message: `A public source clearly mentioned ${giftPreference}. This can support a small, optional gift only if policy and spend approval are in place.`,
          preference: giftPreference,
          sourceUrl: giftSourceUrl,
          claimUrl: input.giftClaimUrl,
          confidence: 0.9,
        }
      : {
          status: "omitted",
          omissionReason: giftPreference
            ? "The preference lacked a safe public source or contained a potentially sensitive cue."
            : "No high-confidence public preference was supplied.",
        },
    task5Hook: `I put together a short ${title} based on ${signal || "the public context around the company"}. It separates what is visible from what still needs validation.`,
    warnings,
  };
}
