import { assetDocumentSchema } from "@/lib/schemas";

// LifeCore's offer comes from the user's competition brief. Northstar Software,
// its working arrangements, and its visual identity are explicitly fictional.
// No employee reviews, customer outcomes, clinical benefits, or coverage claims.
export const lifecoreWellnessAsset = assetDocumentSchema.parse({
  slug: "lifecore-northstar-wellness",
  generatedAt: "2026-10-07T16:15:18.000Z",
  generationMode: "reference",
  documentFormat: "six_part_brief",
  assetType: "action_plan",
  title: "Make your wellness benefit work beyond the head office.",
  subtitle:
    "A coverage-first plan for Northstar Software: give employees useful choices near the places they actually spend their week, then test what gets used.",
  preparedFor: "Northstar Software",
  recipientTitle: "People & Benefits leadership",
  preparedBy: "LifeCore · competition brief",
  documentLabel: "Wellness coverage plan · fictional example",
  brandColor: "#176C55",
  brandBackground: "#143E34",
  brandSurface: "#F1F6F2",
  useNote:
    "Illustrative proposal for fictional Northstar Software. Its locations, working arrangements, and current benefit are scenario assumptions—not public research. LifeCore's stated offer comes from the competition brief. Coverage, pricing, employee demand, and outcomes remain unverified; no comparable-company result or gift is claimed.",
  executiveSummary:
    "Before adding another benefit, check whether each employee group can use it. Compare practical access, choice, and operating effort; pilot the best-fitting option without assuming participation or wellbeing gains.",
  nonObviousInsight:
    "Being eligible for the same benefit is not the same as having equally useful access to it. A network membership is valuable only where its actual locations and activities fit employees' routines.",
  evidence: [],
  sections: [
    {
      id: "current-situation",
      title: "Current situation",
      navigationLabel: "Current situation",
      defaultOpen: true,
      layout: "cards",
      summary:
        "In this illustrative scenario, Northstar has a main office, a smaller second office, and remote employees—with a gym arrangement centered on headquarters.",
      items: [
        {
          title: "Your employees do not share one daily routine",
          description:
            "Office-based and hybrid colleagues work alongside employees away from either office. A location convenient after an office day may not be convenient on a home-working day.",
        },
        {
          title: "Your starting benefit is office-centered",
          description:
            "Your starting arrangement offers a gym near the main office. The next question is whether it also provides useful access for colleagues at the second office or working remotely.",
        },
        {
          title: "Your decision is about usable choice",
          description:
            "The question is whether to keep that arrangement, add flexibility, or consider a broader membership. Actual employee preferences, local availability, employer cost, and administration need to inform the choice.",
        },
      ],
    },
    {
      id: "likely-problem",
      title: "Likely problem",
      navigationLabel: "Likely problem",
      defaultOpen: true,
      layout: "narrative",
      summary:
        "A benefit can be available company-wide while still being inconvenient for colleagues away from the main office.",
      items: [
        {
          title: "The access gap may matter more than the announcement",
          classification: "inference",
          description:
            "If the current gym is inconvenient for employees outside the main office—or does not offer the activities they want—another reminder about the benefit may not change participation. That would be a coverage or preference issue, not proof that employees are disengaged or that HR has communicated poorly.",
        },
        {
          title: "Test the explanation before buying the solution",
          classification: "unknown",
          description:
            "Use an optional, aggregate pulse check to understand which activities, broad areas, and times would make a benefit useful. Distinguish location and choice from cost, time, or simple lack of awareness. If your existing arrangement already fits, keep it. The aim is to establish what your employees need before choosing a provider.",
        },
      ],
    },
    {
      id: "solution",
      title: "A practical solution",
      navigationLabel: "Coverage & pilot plan",
      defaultOpen: true,
      layout: "steps",
      summary:
        "Use this coverage check and pilot plan before committing to a wider rollout. LifeCore is a candidate for the membership—not an assumed answer to every gap.",
      items: [
        {
          title: "Check access for three employee groups",
          description:
            "For each group, record a usable location, the activity available, suitable opening times, and any membership restrictions. Use broad employee areas or voluntary preferences, not exact home addresses or health information. A location on a map is not confirmed membership access.",
          procedure: [
            {
              label: "Main-office team",
              instruction:
                "Compare the current gym with alternatives near the office and broad home-working areas. Check before-work, lunchtime, and after-work availability where relevant.",
            },
            {
              label: "Second-office team",
              instruction:
                "Check actual participating venues and activity choices near this office. Do not assume that coverage around headquarters extends to another area.",
            },
            {
              label: "Remote team",
              instruction:
                "Check coverage in voluntarily supplied broad areas. If useful access is missing, keep an alternative route for that group instead of describing the benefit as universally covered.",
            },
          ],
        },
        {
          title: "Pilot a membership only where the fit is confirmed",
          description:
            "LifeCore offers access to gyms, studios, pools, and wellness classes through one membership. That is worth testing when employees want different activities or locations. Before an opt-in pilot, confirm the relevant venues, eligible activities, employer terms, and any employee contribution. Keep your existing benefit in place while you compare the options.",
          checks: [
            "Confirm participating venues and access terms for each employee group.",
            "Check voluntary interest in the actual activity choices available.",
            "Agree the pilot scope, total cost, review date, and alternative for uncovered groups.",
          ],
        },
        {
          title: "Review useful access and repeat use—not enrolment alone",
          description:
            "Choose the decision criteria before the pilot. Treat low uptake as a question to investigate, not an employee-health diagnosis. Confirm which aggregate reports are available and permitted by your policies before selecting your measures.",
          procedure: [
            {
              label: "Useful access",
              instruction:
                "For each broad group, can interested employees identify a participating venue and activity they would realistically use? Record uncovered areas and unmet preferences.",
            },
            {
              label: "Repeat use",
              instruction:
                "If appropriate aggregate data is available, compare employees using the benefit more than once with employees who used it at least once in the same review period. If the denominator is zero or data is unavailable, record that—not 0% or an invented estimate.",
            },
            {
              label: "Decision",
              instruction:
                "Expand where access, voluntary demand, and agreed cost criteria are met. Adjust the offering for uncovered groups. A short pilot can inform the benefit decision; it cannot establish longer-term retention, productivity, or health effects.",
            },
          ],
        },
      ],
    },
    {
      id: "alternatives",
      title: "Your best options",
      navigationLabel: "Alternative options",
      defaultOpen: true,
      layout: "table",
      summary:
        "Use the same coverage and preference checks for every option. LifeCore earns its place when the network fits your employees better than a simpler approach.",
      columns: ["Option", "When it fits", "What to check"],
      items: [
        {
          title: "Keep the current gym arrangement",
          description: "Preserve an existing benefit when it already works.",
          cells: [
            "Keep the current gym arrangement",
            "Most interested employees can conveniently use it and want what it offers.",
            "Confirm access for the second office and remote groups before calling it company-wide coverage.",
          ],
        },
        {
          title: "Offer a flexible wellbeing allowance",
          description: "Evaluate an employer-managed allowance as another route.",
          cells: [
            "Flexible wellbeing allowance",
            "Employees need varied local options, including areas a shared network does not serve.",
            "Assess administration, eligible spending, employee upfront payment, and applicable payroll treatment with the relevant internal owners.",
          ],
        },
        {
          title: "Arrange local memberships by office",
          description: "Consider separate arrangements for concentrated teams.",
          cells: [
            "Local memberships by office",
            "Teams are concentrated around a few offices and local options match their preferences.",
            "Compare contract management and activity choice. Remote colleagues may still need another option.",
          ],
        },
        {
          title: "LifeCore: one membership, multiple activity types",
          description: "Consider the network membership described in the brief.",
          cells: [
            "LifeCore · network membership",
            "Employees want gyms, studios, pools, or classes across different routines—and useful participating locations are confirmed.",
            "Verify coverage, access restrictions, total cost, and employer administration. A broad network description is not a guarantee of access everywhere.",
          ],
        },
      ],
    },
  ],
  callToAction: {
    message:
      "Happy to walk through a coverage comparison for your main office, second office, and remote team—and show how LifeCore's gyms, studios, pools, and classes could fit into one membership. We can use it to decide whether a small pilot makes sense, or whether your current arrangement or an allowance is the better fit.",
  },
  recommendedActions: [
    "Check useful access and voluntary preferences across the three employee groups.",
    "Compare the current arrangement, an allowance, local memberships, and LifeCore on the same criteria.",
    "Pilot only after confirming coverage and terms; decide using agreed access, use, and cost criteria.",
  ],
  sources: [],
  gift: { status: "omitted" },
  task5Hook:
    "I put together a coverage-first wellness plan for your office and remote teams, including a practical pilot checklist and a comparison of LifeCore with your existing options. It starts with whether employees can actually use the benefit, rather than assuming another membership is the answer.",
  warnings: [
    "Authored practice reference; not generated by Claude, Grok, or the live API.",
    "Northstar Software and its circumstances are fictional. Replace scenario assumptions with verified prospect evidence before outreach.",
    "No similar-company results, employee-review evidence, confirmed network coverage, clinical claims, or gift approval supplied.",
  ],
});
