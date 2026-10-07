export const CONTEXT_ONLY_RULES = `
This runtime has NO browsing, screenshot, audit, or LinkedIn tools. Work only from supplied context.
Never imply you inspected a page, checked a source today, tested a user journey, or verified a company event.
When evidence is missing, create a useful proposed plan or worksheet, not findings. Label fictional practice companies in useNote and documentLabel.
Do not fabricate a logo, domain, source URL, verified brand palette, checkedAt date, or purchased gift. Omit logoUrl unless an exact verified logo URL was supplied. Use a neutral editorial palette if no verified branding was supplied.
Only cite exact URLs supplied in the input. Links without source text are supplied references, not verified evidence. Keep sources empty if none were supplied.
Keep the four required body sections compact, at most 4 items each. Each table row must have a cells array exactly as long as columns. Use plain text, not Markdown tables inside strings.
Use preparedBy for the seller, preparedFor for the prospect, and documentLabel for the deliverable type. Do not expose universe, scores, or signal logic in recipient content.
Give each section a short navigationLabel describing its actual content. Use short titles. For a reusable template, use narrative layout and put copyable text in description.
`;
