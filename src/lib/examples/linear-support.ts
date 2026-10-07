import { assetDocumentSchema } from "@/lib/schemas";

const invite = "https://linear.app/docs/invite-members";
const roles = "https://linear.app/docs/members-roles";
const triage = "https://linear.app/docs/triage";

// Authored reference, not an on-demand AI result. No hiring, backlog, or team-size
// claim is made about Linear. SupportLoop is the fictional seller in the exercise.
export const linearSupportAsset = assetDocumentSchema.parse({
  slug: "linear-support-onboarding",
  generatedAt: "2026-10-07T16:00:00.000Z",
  generationMode: "reference",
  assetType: "toolkit",
  title: "A first-week support kit. Built around Linear.",
  subtitle:
    "Three customer replies, a clear escalation path, and five days of practice. Ready for your support lead to review and adapt.",
  preparedFor: "Linear",
  recipientTitle: "Support leadership",
  companyDomain: "linear.app",
  logoUrl: "/brands/linear-wordmark-dark.svg",
  brandColor: "#5E6AD2",
  brandBackground: "#222326",
  brandSurface: "#F4F5F8",
  preparedBy: "SupportLoop · independent concept",
  documentLabel: "Support enablement kit",
  useNote:
    "An independent working draft built from public documentation. Product steps are sourced; routing and training are proposals for your team to approve. No access to your tickets, internal procedures, or performance data.",
  executiveSummary:
    "Give a new teammate something concrete to practice: one access request, one permissions question, and one issue-routing question. Each pairs a customer-facing draft with a check before sending.",
  nonObviousInsight:
    "A missing invitation, limited project visibility, and an issue missing from a view can look like bugs. The first useful question is often about access or configuration, not engineering capacity.",
  evidence: [],
  sections: [
    {
      id: "replies",
      eyebrow: "Start with the work",
      title: "Three replies your team can make their own.",
      summary:
        "Copy the customer-facing draft. Keep the internal checks with the agent. These are practice scenarios, not claims about your most common tickets.",
      layout: "replies",
      defaultOpen: true,
      items: [
        {
          title: "The invitation that never arrived",
          value: "Getting your teammate into Linear",
          usage:
            "Use when a customer says a teammate has not received an invitation.",
          description:
            "Hi [first name],\n\nCould you confirm whether your workspace uses SCIM? If it does, your identity-provider administrator manages member and admin access; guest invitations are handled separately.\n\nOtherwise, ask an authorized workspace admin to check the address and pending invitation in Settings → Administration → Members. If delivery is being filtered, your email administrator can allow notifications@linear.app and pm_bounces@pm-bounces.linear.app.\n\nIf that does not resolve it, send the affected email address and approximate invite time through your approved support channel. Please do not send passwords or sign-in links.",
          checks: [
            "Confirm the requester is authorized before discussing workspace membership.",
            "Check the workspace's provisioning path before recommending another invitation.",
          ],
          sourceUrl: invite,
        },
        {
          title: "The guest who cannot see the whole project",
          value: "Checking project access for your guest",
          usage:
            "Use when a guest reports missing issues in a project spanning multiple teams.",
          description:
            "Hi [first name],\n\nA guest can see the issues belonging to teams they have been added to. In a project that spans teams, they may see the project itself without seeing every team's issues.\n\nAsk the appropriate team owner to confirm the guest's team membership and intended access. Avoid changing their workspace role just to troubleshoot a visibility question.\n\nIf the issue belongs to a team the guest already has access to, share the issue link and a redacted screenshot through your approved support channel so we can investigate the specific mismatch.",
          checks: [
            "Confirm which team owns the missing issue and whether the requester may access it.",
            "Do not reproduce private issue content in a reply to an unauthorized guest.",
          ],
          sourceUrl: roles,
        },
        {
          title: "The issue that disappeared from a view",
          value: "Finding an issue that is still in Triage",
          usage:
            "Use when a customer can find an issue in Triage but not in a normal view.",
          description:
            "Hi [first name],\n\nIf the issue is still in Triage, that can explain why it is absent from your normal view. Triage issues are excluded from views by default.\n\nTo include them in a custom view, add Triage to its status filter. If the issue is ready to enter the team's workflow, the triage owner can review and accept it instead.\n\nIf it remains missing, share the issue link and the view's filter settings through your approved support channel. We can compare those before treating it as a product defect.",
          checks: [
            "Confirm the issue's current status and the view filters.",
            "Do not change issue status simply to make a screenshot match.",
          ],
          sourceUrl: triage,
        },
      ],
    },
    {
      id: "routing",
      eyebrow: "A proposed operating rule",
      title: "Resolve the question. Route the exception.",
      summary:
        "Suggested ownership for these scenarios, not a description of Linear's internal organization. Substitute your actual queues and response commitments.",
      layout: "table",
      columns: [
        "Scenario",
        "First check",
        "Proposed next owner",
        "Include in the handoff",
      ],
      items: [
        {
          title: "Access or invitation",
          description: "Keep account changes with an authorized administrator.",
          cells: [
            "Invitation or provisioning",
            "Identity, workspace, provisioning method",
            "Workspace / IdP administrator; support if still blocked",
            "Invite time, affected identity, method, redacted error. No credentials.",
          ],
        },
        {
          title: "Permissions or visibility",
          description:
            "Investigate the access boundary before escalating as a defect.",
          cells: [
            "Guest cannot see an issue",
            "Guest role, issue team, intended access",
            "Team owner; product support for a reproducible mismatch",
            "Issue reference, expected access, actual result, checks already completed.",
          ],
        },
        {
          title: "Triage or view configuration",
          description:
            "Rule out status and filter behavior before engineering investigation.",
          cells: [
            "Issue absent from a view",
            "Issue status and active filters",
            "Triage owner; product support if configuration cannot explain it",
            "Issue and view references, filter settings, reproducible steps.",
          ],
        },
        {
          title: "Suspected privacy or security issue",
          description:
            "This is a proposed precaution, not a published Linear incident process.",
          cells: [
            "Unexpected access or sensitive-data exposure",
            "Limit collection and sharing of sensitive material",
            "Your designated security / incident channel",
            "Minimal redacted evidence and timing. Do not promise a resolution deadline.",
          ],
        },
      ],
    },
    {
      id: "first-week",
      eyebrow: "Practice, then calibrate",
      title: "A first week with something to show for it.",
      summary:
        "A suggested training sequence. Run exercises in a safe test workspace or with fabricated tickets; review every reply before using it with a customer.",
      layout: "checklist",
      items: [
        {
          title: "Day 1 · Know the boundaries",
          description: "Deliverable: an annotated access map.",
          checks: [
            "Read the three linked documentation pages.",
            "Record who can approve access changes in your own process.",
            "Identify where to send a security-sensitive report.",
          ],
        },
        {
          title: "Day 2 · Write the first reply",
          description: "Deliverable: three reviewed response drafts.",
          checks: [
            "Use each sample scenario to write a response without copying blindly.",
            "Have a reviewer check the steps against the linked source.",
            "Remove any promise not supported by your team's policy.",
          ],
        },
        {
          title: "Day 3 · Practice the handoff",
          description: "Deliverable: one complete escalation packet.",
          checks: [
            "Reproduce one permission or view-configuration scenario safely.",
            "Capture expected versus actual behavior and checks already completed.",
            "Have the receiving teammate confirm they can act without asking for missing context.",
          ],
        },
        {
          title: "Day 4 · Calibrate judgment",
          description:
            "Deliverable: a short list of disagreements and resolutions.",
          checks: [
            "Have two reviewers independently route the same fabricated tickets.",
            "Discuss differences in identity checks, ownership, and engineering escalation.",
            "Update the proposed matrix with your team's decisions.",
          ],
        },
        {
          title: "Day 5 · Publish the approved version",
          description: "Deliverable: a small, owned response library.",
          checks: [
            "Assign an owner to each reply and routing rule.",
            "Record the review date and the documentation source.",
            "Agree when product or policy changes should trigger another review.",
          ],
        },
      ],
    },
    {
      id: "handoff",
      eyebrow: "One reusable template",
      title: "Give the next person enough to act.",
      summary:
        "Copy this into your internal escalation tool. Replace the placeholders and omit information the receiving team does not need.",
      layout: "replies",
      items: [
        {
          title: "Internal escalation packet",
          value: "[Workflow] · [Expected outcome] · [Observed result]",
          description:
            "Customer impact: [What is blocked, stated by the customer]\nAuthorized requester confirmed: [How your policy was followed]\nWorkspace / issue reference: [Approved internal reference]\nExpected behavior: [Include source or approved policy]\nObserved behavior: [What happened, without interpretation]\nSteps to reproduce: [Smallest safe sequence]\nChecks completed: [Identity, access, status, filters as relevant]\nEvidence: [Redacted screenshot / error and time]\nRequested decision: [What you need the next owner to determine]\nNext customer update: [Only a commitment your team has approved]",
          checks: [
            "Never include passwords, tokens, sign-in links, or unnecessary personal data.",
            "Keep the proposed diagnosis separate from what you observed.",
          ],
        },
      ],
    },
  ],
  recommendedActions: [
    "Have a support lead validate the product steps and fill the placeholders before customer use.",
    "Replace proposed escalation owners with your real queues and security procedure.",
    "Pilot the kit on fabricated scenarios, then revise it using reviewer feedback rather than assuming a performance improvement.",
  ],
  sources: [
    {
      label: "Invite members",
      url: invite,
      checkedAt: "2026-10-07",
      note: "Invitation delivery and identity-provider provisioning branches.",
    },
    {
      label: "Members and roles",
      url: roles,
      checkedAt: "2026-10-07",
      note: "Guest access and cross-team project visibility.",
    },
    {
      label: "Triage",
      url: triage,
      checkedAt: "2026-10-07",
      note: "Default view exclusion and accepting an issue into the workflow.",
    },
    {
      label: "Linear brand guidelines",
      url: "https://linear.app/brand",
      checkedAt: "2026-10-07",
      note: "Logo assets and monochrome palette. Brand use does not imply affiliation.",
    },
  ],
  gift: { status: "omitted" },
  task5Hook:
    "I put together a small onboarding kit around three documented Linear workflows: invitations, guest visibility, and Triage. It includes draft replies and a proposed escalation handoff your support lead can adapt.",
  warnings: [
    "Reference example authored from public documentation, not live autonomous generation.",
    "No claim about Linear hiring, ticket frequency, backlog, or team performance has been verified or made.",
  ],
});
