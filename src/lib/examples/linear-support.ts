import { assetDocumentSchema } from "@/lib/schemas";

const invite = "https://linear.app/docs/invite-members";
const roles = "https://linear.app/docs/members-roles";
const triage = "https://linear.app/docs/triage";

// Authored practice reference. SupportLoop is a fictional seller, not a
// verified deployed product. No hiring, backlog, or internal performance claims.
export const linearSupportAsset = assetDocumentSchema.parse({
  slug: "linear-support-onboarding",
  generatedAt: "2026-10-07T16:00:00.000Z",
  generationMode: "reference",
  documentFormat: "six_part_brief",
  assetType: "action_plan",
  title: "A clearer path from support question to resolution.",
  subtitle:
    "A practical support workflow proposal for Linear: diagnose the situation, identify the next owner, and hand over a complete case.",
  preparedFor: "Linear",
  recipientTitle: "Support leadership",
  companyDomain: "linear.app",
  logoUrl: "/brands/linear-wordmark-dark.svg",
  brandColor: "#5E6AD2",
  brandBackground: "#222326",
  brandSurface: "#F4F5F8",
  preparedBy: "SupportLoop · practice concept",
  documentLabel: "Personalized support brief",
  useNote:
    "Based on public product documentation, not internal support data. SupportLoop and its proposed workflow are a practice concept, not a verified product implementation.",
  executiveSummary:
    "Start with three documented workflows and one consistent handoff. Validate whether this solves a real support problem before changing your process.",
  nonObviousInsight:
    "A question that looks like a defect may be explained by provisioning, permissions, or filters. The proposed workflow makes that distinction explicit before escalation.",
  evidence: [],
  sections: [
    {
      id: "current-situation",
      title: "Current situation",
      navigationLabel: "Current situation",
      layout: "cards",
      defaultOpen: true,
      summary:
        "Your public documentation describes several distinct paths a support investigation may need to follow. It does not tell us how often your team receives these questions.",
      items: [
        {
          title: "Invitations depend on provisioning",
          description:
            "Invitation troubleshooting differs between identity-provider provisioning and invitations managed inside a workspace.",
          classification: "fact",
          sourceUrl: invite,
        },
        {
          title: "Visibility depends on access boundaries",
          description:
            "Guest access and team membership affect what someone can see in a cross-team project.",
          classification: "fact",
          sourceUrl: roles,
        },
        {
          title: "An issue's status changes where it appears",
          description:
            "Triage issues are excluded from views by default; status and filter settings matter when investigating a missing issue.",
          classification: "fact",
          sourceUrl: triage,
        },
      ],
    },
    {
      id: "likely-problem",
      title: "Likely problem",
      navigationLabel: "Likely problem",
      layout: "narrative",
      defaultOpen: true,
      summary:
        "A hypothesis to validate—not a diagnosis of Linear's support team.",
      items: [
        {
          title: "The same symptom can need a different next step",
          classification: "inference",
          description:
            "If an agent begins with the symptom alone—an invitation missing, a project incomplete, or an issue absent—they may need another exchange to establish the correct configuration and owner. A consistent first-check sequence could reduce that avoidable back-and-forth. Whether this is a meaningful problem at Linear requires ticket evidence, not an assumption from the documentation.",
        },
        {
          title: "What would confirm or reject this",
          classification: "unknown",
          description:
            "Review a small, approved sample of these cases. Check whether the provisioning method, access boundary, or active filters were captured before escalation, and whether the next owner asked for missing context. No comparable-company outcome or performance benchmark has been supplied, so none is claimed here.",
        },
      ],
    },
    {
      id: "solution",
      title: "A practical solution",
      navigationLabel: "Solution",
      layout: "steps",
      defaultOpen: true,
      summary:
        "A proposed SupportLoop workflow: establish the branch, name the owner, and hand over the evidence. These steps can also be tested manually before deciding on a platform.",
      items: [
        {
          title: "Start with the right diagnostic branch",
          description:
            "Give the agent a short first-check path rather than a generic escalation instruction.",
          procedure: [
            {
              label: "Invitation",
              instruction:
                "Identify SCIM versus workspace-managed provisioning before recommending another invitation. Keep identity and access changes with an authorized administrator.",
            },
            {
              label: "Guest visibility",
              instruction:
                "Check the issue's owning team and intended guest access before treating limited visibility as a defect.",
            },
            {
              label: "Missing issue",
              instruction:
                "Compare the issue's status with the view's filters. If it is in Triage, first check whether that status is included in the view.",
            },
          ],
        },
        {
          title: "Make the handoff usable immediately",
          description:
            "Record the observed symptom, expected behavior, checks already completed, minimal redacted evidence, proposed next owner, and the decision needed. Keep the diagnosis separate from what was observed. Never collect passwords or sign-in links.",
          checks: [
            "Confirm the requester is authorized.",
            "Record expected versus observed behavior.",
            "Name the next owner and the decision needed.",
          ],
        },
        {
          title: "Choose the tool only after the workflow earns its place",
          description:
            "Have a support lead test the sequence on fabricated or approved cases. If the sequence is useful but difficult to maintain consistently, evaluate whether SupportLoop could make those checks and handoffs part of the agent's workflow. Product capabilities and integration fit would need to be demonstrated; no automated connection or time saving is claimed here.",
        },
      ],
    },
    {
      id: "alternatives",
      title: "Your best options",
      navigationLabel: "Alternative options",
      layout: "table",
      defaultOpen: true,
      summary:
        "Choose based on the actual bottleneck. A new platform is not automatically the best answer.",
      columns: ["Option", "Best fit", "Tradeoff / what to check"],
      items: [
        {
          title: "Existing documentation + manual checklist",
          description: "Keep the workflow in your current tools.",
          cells: [
            "Existing documentation + manual checklist",
            "The scenarios are infrequent and agents already route them consistently.",
            "Lowest process change; someone still owns keeping the checklist aligned with product changes.",
          ],
        },
        {
          title: "Configure your current support system",
          description: "Evaluate the tooling you already use.",
          cells: [
            "Configure your current support system",
            "Your existing system can capture the needed fields and route cases without awkward workarounds.",
            "Check available features, plan restrictions, and maintenance effort before buying anything new.",
          ],
        },
        {
          title: "SupportLoop as an alternative",
          description: "Evaluate the proposed guided-workflow approach.",
          cells: [
            "SupportLoop · proposed alternative",
            "Inconsistent diagnostic steps or incomplete handoffs are confirmed, and existing tooling does not address them well.",
            "Ask for a walkthrough using these three Linear scenarios. Verify capabilities, integration fit, security, and cost; this practice concept does not establish them.",
          ],
        },
      ],
    },
  ],
  callToAction: {
    message:
      "Happy to walk you through the invitation, guest-access, and Triage scenarios—and show how a SupportLoop workflow could keep the first check, next owner, and handoff together. We can use those examples to decide whether your existing tools already cover the need.",
  },
  recommendedActions: [
    "Validate the hypothesis using approved case evidence.",
    "Try the proposed workflow before evaluating a platform.",
    "Compare the existing system with the proposed alternative using the same scenarios.",
  ],
  sources: [
    {
      label: "Invite members",
      url: invite,
      checkedAt: "2026-10-07",
      note: "Provisioning and invitation paths; not ticket volume.",
    },
    {
      label: "Members and roles",
      url: roles,
      checkedAt: "2026-10-07",
      note: "Guest and team-access boundaries.",
    },
    {
      label: "Triage",
      url: triage,
      checkedAt: "2026-10-07",
      note: "Triage status and view behavior.",
    },
    {
      label: "Linear brand guidelines",
      url: "https://linear.app/brand",
      checkedAt: "2026-10-07",
      note: "Brand assets, not an affiliation or endorsement.",
    },
  ],
  gift: { status: "omitted" },
  task5Hook:
    "I mapped three documented Linear support scenarios into a proposed first-check and handoff workflow, with a comparison of existing-tool options and a SupportLoop approach. The brief distinguishes public facts from the hypothesis we would need to validate.",
  warnings: [
    "Authored practice reference, not live autonomous generation.",
    "No hiring, backlog, support-performance, similar-company outcome, or gift approval was supplied.",
  ],
});
