import type { ProcessDefinition } from "@/types/operations.types";

export const CMP_PROCESS_ID = "cmp-compass-food";

/** Demo template — not verified Compass Food Service policy. */
export const CMP_INITIAL_DEFINITION: ProcessDefinition = {
	id: CMP_PROCESS_ID,
	name: "Central Menu Planning (CMP)",
	industryLabel: "Food service — demo template",
	steps: [
		{
			id: "mp",
			name: "Menu Planning",
			order: 1,
			role: "Menu Planner",
			dependsOn: [],
			dataset: "MP",
			rules: ["Weekly cycle menu locked before projection"],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "MP",
		},
		{
			id: "mproj",
			name: "Menu Projection",
			order: 2,
			role: "Unit Manager",
			dependsOn: ["mp"],
			dataset: "MP",
			rules: ["Covers projected from historical occupancy"],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "MP",
		},
		{
			id: "mr",
			name: "Menu Requisition",
			order: 3,
			role: "Unit Manager",
			dependsOn: ["mproj"],
			dataset: "MR",
			deadlineLabel: "D-3 by 16:00 (demo assumption)",
			rules: ["Submitted three service days ahead by 16:00"],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "MR",
		},
		{
			id: "pp",
			name: "Production Plan",
			order: 4,
			role: "Chef Manager",
			dependsOn: ["mr"],
			dataset: "PP",
			rules: ["Plan derived from approved requisition"],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "PP",
		},
		{
			id: "ki",
			name: "Kitchen Indent",
			order: 5,
			role: "Unit Manager",
			dependsOn: ["pp"],
			dataset: "KI",
			rules: ["Indent quantity within 5% of production plan"],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "KI",
		},
		{
			id: "gi",
			name: "Goods Issue",
			order: 6,
			role: "Stores",
			dependsOn: ["ki"],
			dataset: "GI",
			rules: [
				"Issued quantity compared to production plan after UOM normalisation",
			],
			factStatus: "missing",
			isDemoAssumption: true,
			verifiableIn: "GI",
		},
	],
	rules: [
		{
			id: "rule-mr-deadline",
			kind: "deadline",
			stepId: "mr",
			daysBeforeService: 3,
			hour: 16,
			minute: 0,
			label: "Menu Requisition submitted by D-3 16:00",
			isDemoAssumption: true,
		},
		{
			id: "rule-ki-role",
			kind: "role",
			stepId: "ki",
			expectedRole: "Chef Manager",
			label: "Kitchen Indent raised by Chef Manager",
			isDemoAssumption: true,
		},
		{
			id: "rule-pp-sequence",
			kind: "sequence",
			stepId: "pp",
			requiresStepId: "mr",
			label: "Production Plan follows Menu Requisition",
			isDemoAssumption: true,
		},
		{
			id: "rule-gi-qty",
			kind: "quantityTolerance",
			stepId: "gi",
			compareToStepId: "pp",
			field: "quantity",
			tolerancePct: 15,
			label:
				"Goods Issue within 15% of Production Plan (after UOM normalisation)",
			isDemoAssumption: true,
		},
	],
};

export const CMP_SITES = [
	{ id: "northgate", name: "Northgate Campus", code: "NG" },
	{ id: "riverside", name: "Riverside Park", code: "RP" },
	{ id: "lakeview", name: "Lakeview Plaza", code: "LP" },
	{ id: "harbor", name: "Harbor Point", code: "HP" },
] as const;

export const CMP_UOM_TO_BASE: Record<
	string,
	{ base: "g" | "ml" | "ea"; factor: number }
> = {
	kg: { base: "g", factor: 1000 },
	g: { base: "g", factor: 1 },
	L: { base: "ml", factor: 1000 },
	ml: { base: "ml", factor: 1 },
	ea: { base: "ea", factor: 1 },
	portion: { base: "ea", factor: 1 },
};
