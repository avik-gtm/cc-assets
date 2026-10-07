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
  title: "Support operations field guide",
  subtitle:
    "Linear · diagnostic playcards, escalation ownership, and a five-day onboarding plan.",
  preparedFor: "Linear",
  recipientTitle: "Support leadership",
  companyDomain: "linear.app",
  logoUrl: "/brands/linear-wordmark-dark.svg",
  brandColor: "#5E6AD2",
  brandBackground: "#222326",
  brandSurface: "#F4F5F8",
  preparedBy: "SupportLoop · independent concept",
  documentLabel: "Operations / Onboarding",
  useNote:
    "Based on public product documentation, not internal ticket data. Routing and training are proposed practices for your team to approve.",
  executiveSummary:
    "Use the playcards to distinguish configuration questions from exceptions, the matrix to assign the next owner, and the handoff template to record a reproducible case. The practice plan ties each workflow to a reviewable output.",
  nonObviousInsight:
    "A missing invitation, limited project visibility, and an issue missing from a view can look like bugs. The first useful question is often about access or configuration, not engineering capacity.",
  evidence: [],
  sections: [
    {
      id: "playcards",
      navigationLabel: "Diagnostic playcards",
      title: "Diagnostic playcards",
      summary:
        "A first check, an action path, and a boundary for each workflow. These are practice scenarios, not claims about ticket frequency or current performance.",
      layout: "cards",
      defaultOpen: true,
      items: [
        {
          title: "The invitation that never arrived",
          usage:
            "Use when a customer says a teammate has not received an invitation.",
          description:
            "First check: identify the provisioning method, then follow the matching path.",
          procedure: [
            {
              label: "SCIM workspace",
              instruction:
                "Ask the identity-provider administrator to check member/admin provisioning. Guest invitations follow a separate path.",
            },
            {
              label: "Non-SCIM workspace",
              instruction:
                "An authorized admin checks the address and pending invitation in Settings → Administration → Members. If email is filtered, the email administrator can allow notifications@linear.app and pm_bounces@pm-bounces.linear.app.",
            },
            {
              label: "Still blocked",
              instruction:
                "Record the affected identity, approximate invite time, provisioning method, and redacted error in an approved support channel. Never collect passwords or sign-in links.",
            },
          ],
          checks: [
            "Confirm the requester is authorized before discussing workspace membership.",
            "Check the workspace's provisioning path before recommending another invitation.",
          ],
          sourceUrl: invite,
        },
        {
          title: "The guest who cannot see the whole project",
          usage:
            "Use when a guest reports missing issues in a project spanning multiple teams.",
          description:
            "First check: identify the team that owns the missing issue and the guest's team membership.",
          procedure: [
            {
              label: "Outside the issue's team",
              instruction:
                "Limited visibility may be expected: seeing a cross-team project does not grant access to every team's issues. Ask the appropriate owner to confirm intended access.",
            },
            {
              label: "Access already granted",
              instruction:
                "Capture the issue reference, expected access, and a redacted screenshot for product support.",
            },
            {
              label: "Access boundary",
              instruction:
                "Do not broaden a workspace role just to troubleshoot, or disclose private issue content to an unauthorized guest.",
            },
          ],
          checks: [
            "Confirm which team owns the missing issue and whether the requester may access it.",
            "Do not reproduce private issue content in a reply to an unauthorized guest.",
          ],
          sourceUrl: roles,
        },
        {
          title: "The issue that disappeared from a view",
          usage:
            "Use when a customer can find an issue in Triage but not in a normal view.",
          description:
            "First check: compare the issue's current status with the view's active filters.",
          procedure: [
            {
              label: "Still in Triage",
              instruction:
                "Triage issues are excluded from views by default. Include Triage in a custom view's status filter if that view should display them.",
            },
            {
              label: "Ready for the workflow",
              instruction:
                "The triage owner reviews and accepts the issue. Do not change status solely to make a screenshot match.",
            },
            {
              label: "Still unexplained",
              instruction:
                "Record the issue and view references, filters, and reproduction steps before treating it as a suspected defect.",
            },
          ],
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
      navigationLabel: "Routing matrix",
      eyebrow: "A proposed operating rule",
      title: "Escalation routing matrix",
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
      navigationLabel: "Five-day practice plan",
      eyebrow: "Practice, then calibrate",
      title: "Five-day onboarding plan",
      summary:
        "A proposed training sequence. Run exercises in a safe test workspace or with fabricated tickets; validate each procedure with the support lead before operational use.",
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
          title: "Day 2 · Diagnose the scenario",
          description: "Deliverable: three reviewed diagnostic records.",
          checks: [
            "For each playcard, record the first check, observed result, and next action.",
            "Have a reviewer check the steps against the linked source.",
            "Separate expected product behavior from an unexplained exception.",
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
          description: "Deliverable: a small, owned operating guide.",
          checks: [
            "Assign an owner to each playcard and routing rule.",
            "Record the review date and the documentation source.",
            "Agree when product or policy changes should trigger another review.",
          ],
        },
      ],
    },
    {
      id: "handoff",
      navigationLabel: "Handoff template",
      eyebrow: "One reusable template",
      title: "Escalation handoff template",
      summary:
        "Copy this into your internal escalation tool. Replace the placeholders and omit information the receiving team does not need.",
      layout: "narrative",
      items: [
        {
          title: "Internal escalation packet",
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
    "I put together an operations field guide around three documented Linear workflows: invitations, guest visibility, and Triage. It includes diagnostic playcards, a proposed routing matrix, and an escalation handoff your support lead can adapt.",
  warnings: [
    "Reference example authored from public documentation, not live autonomous generation.",
    "No claim about Linear hiring, ticket frequency, backlog, or team performance has been verified or made.",
  ],
});
