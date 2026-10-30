import type { DeviationType } from "@/types/operations.types";

export type NarrativeKey = `${DeviationType}:${string}` | DeviationType;

export const CMP_NARRATIVES: Record<
	string,
	{
		title: string;
		whyItMatters: string;
		explanations: string[];
		actions: string[];
	}
> = {
	"late:mr": {
		title: "Requisitions arriving after the stated cut-off",
		whyItMatters:
			"Late requisitions compress production planning and increase last-minute substitutions, which usually raises cost and waste.",
		explanations: [
			"Hypothesis: site teams wait for final headcount before locking the requisition.",
			"Hypothesis: the cut-off time is known but not enforced in the weekly rhythm.",
			"Hypothesis: approvals sit with one person who is often unavailable mid-afternoon.",
		],
		actions: [
			"Confirm whether the D-3 cut-off still matches how sites actually work.",
			"Ask Unit Managers at the affected sites what blocks earlier submission.",
			"Pilot an earlier soft reminder the day before the cut-off.",
		],
	},
	"missing_step:pp": {
		title: "Production Plan records missing for some cases",
		whyItMatters:
			"Without a Production Plan we cannot tell whether cooking was planned from the requisition or improvised on the day.",
		explanations: [
			"Hypothesis: the step was skipped and kitchens cooked from the requisition directly.",
			"Hypothesis: plans exist in another workbook that was not uploaded.",
			"Hypothesis: records could not be linked to the case ID used in other sheets.",
		],
		actions: [
			"Check whether Production Plan files for those weeks exist outside the uploaded set.",
			"Confirm the case ID convention used in Production Plan sheets.",
			"Interview Chef Managers at the affected sites about how they plan when the formal plan is absent.",
		],
	},
	"wrong_role:ki": {
		title: "Kitchen Indent ownership differs from the stated process",
		whyItMatters:
			"Records and the stated owner do not match. That may mean the process description is outdated, not that sites failed a control.",
		explanations: [
			"Hypothesis: the stated owner reflects a policy that sites no longer follow.",
			"Hypothesis: indent entry is delegated, and the record shows who typed it rather than who approved it.",
			"Hypothesis: system access was granted to a different role than the process describes.",
		],
		actions: [
			"Verify actual ownership with operations before treating this as a failure.",
			"Update the stated process if the recorded role is the real owner.",
			"Review system permissions only after the intended owner is confirmed.",
		],
	},
	"quantity_variance:gi": {
		title: "Goods Issue quantities above Production Plan",
		whyItMatters:
			"Issuing more than planned may signal waste, substitutions, or measurement differences — it needs investigation, not an automatic fault.",
		explanations: [
			"Hypothesis: UOM or portion sizing differs between plan and issue sheets.",
			"Hypothesis: last-minute cover increases were not reflected in the plan.",
			"Hypothesis: stores issue buffer stock that is not returned in the same week.",
		],
		actions: [
			"Compare issued lines to the plan after confirming units of measure.",
			"Ask Stores and Chef Managers about buffer practices.",
			"Flag only recurring over-issue patterns for cost review.",
		],
	},
	late: {
		title: "Activity completed after the stated deadline",
		whyItMatters:
			"Missed deadlines shorten the time available for downstream work.",
		explanations: [
			"Hypothesis: the deadline no longer matches operational reality.",
			"Hypothesis: handoffs between roles introduce delay.",
		],
		actions: [
			"Review the stated deadline with the owning role.",
			"Check whether downstream steps absorb the delay without quality loss.",
		],
	},
	wrong_role: {
		title: "Unexpected role performed the activity",
		whyItMatters:
			"Role mismatches make ownership and escalation paths unclear.",
		explanations: [
			"Hypothesis: informal delegation is common on busy weeks.",
			"Hypothesis: the stated role is out of date.",
		],
		actions: [
			"Confirm intended ownership with operations leads.",
			"Update the process definition if practice has changed.",
		],
	},
	missing_step: {
		title: "Expected activity not found in source records",
		whyItMatters:
			"Missing records may mean a skipped step, an upload gap, or a linking problem.",
		explanations: [
			"Hypothesis: the step was skipped.",
			"Hypothesis: the record was not uploaded.",
			"Hypothesis: records could not be linked to the case.",
		],
		actions: [
			"Search for alternate source files for the missing weeks.",
			"Validate case ID conventions across sheets.",
		],
	},
	quantity_variance: {
		title: "Quantity variance between linked steps",
		whyItMatters:
			"Large quantity gaps after unit normalisation deserve investigation before treating them as errors.",
		explanations: [
			"Hypothesis: measurement or UOM differences remain.",
			"Hypothesis: demand changed after the plan was frozen.",
		],
		actions: [
			"Re-check units of measure on both records.",
			"Interview the sites involved about the variance week.",
		],
	},
	sequence: {
		title: "Activities out of the stated order",
		whyItMatters:
			"Out-of-order work can bypass controls the process assumes are in place.",
		explanations: [
			"Hypothesis: teams shortcut under time pressure.",
			"Hypothesis: timestamps reflect data entry, not real work order.",
		],
		actions: [
			"Validate whether timestamps reflect work time or entry time.",
			"Clarify which controls are mandatory versus preferred.",
		],
	},
	rework: {
		title: "Repeated activity on the same case",
		whyItMatters: "Rework usually signals unclear inputs or late changes.",
		explanations: [
			"Hypothesis: upstream inputs changed after the first attempt.",
			"Hypothesis: quality checks forced a redo.",
		],
		actions: [
			"Review the cases with multiple attempts.",
			"Identify the change that triggered rework.",
		],
	},
};

export function getNarrative(type: DeviationType, stepId: string) {
	return (
		CMP_NARRATIVES[`${type}:${stepId}`] ??
		CMP_NARRATIVES[type] ?? {
			title: "Needs attention",
			whyItMatters: "This pattern differs from how the process was described.",
			explanations: ["Hypothesis: practice diverges from the stated process."],
			actions: ["Review the affected cases with the owning team."],
		}
	);
}
