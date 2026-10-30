import type {
	DiscoveryScriptTurn,
	ProcessDefinition,
} from "@/types/operations.types";

function confirmStep(
	definition: ProcessDefinition,
	stepId: string,
	patch: Partial<ProcessDefinition["steps"][number]>,
): ProcessDefinition {
	return {
		...definition,
		steps: definition.steps.map((step) =>
			step.id === stepId
				? { ...step, ...patch, factStatus: "confirmed" as const }
				: step,
		),
	};
}

function updateDeadlineRule(
	definition: ProcessDefinition,
	hour: number,
	minute: number,
	daysBeforeService: number,
): ProcessDefinition {
	const label = `Menu Requisition submitted by D-${daysBeforeService} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
	return {
		...definition,
		steps: definition.steps.map((step) =>
			step.id === "mr"
				? {
						...step,
						deadlineLabel: `${label} (demo assumption)`,
						rules: [label],
						factStatus: "confirmed" as const,
					}
				: step,
		),
		rules: definition.rules.map((rule) =>
			rule.id === "rule-mr-deadline" && rule.kind === "deadline"
				? { ...rule, hour, minute, daysBeforeService, label }
				: rule,
		),
	};
}

function parseDeadline(answer: string): {
	hour: number;
	minute: number;
	days: number;
} {
	const lower = answer.toLowerCase();
	if (
		lower.includes("18:00") ||
		lower.includes("6 pm") ||
		lower.includes("6pm")
	) {
		return { hour: 18, minute: 0, days: 3 };
	}
	if (lower.includes("noon") || lower.includes("12:00")) {
		return { hour: 12, minute: 0, days: 3 };
	}
	if (lower.includes("d-2")) {
		return { hour: 16, minute: 0, days: 2 };
	}
	return { hour: 16, minute: 0, days: 3 };
}

export const CMP_DISCOVERY_SCRIPT: DiscoveryScriptTurn[] = [
	{
		id: "intro",
		assistantMessages: [
			"I'll help you describe how Central Menu Planning works at your sites, then we'll compare that with operational records.",
			"We'll capture the steps, who owns each one, and the rules you believe should hold — clearly labelled as stated process, not verified policy.",
		],
		revealStepIds: [],
	},
	{
		id: "steps",
		assistantMessages: [
			"From what you've shared, the weekly flow looks like Menu Planning → Menu Projection → Menu Requisition → Production Plan → Kitchen Indent → Goods Issue.",
			"Does that match how you think about it?",
		],
		question: {
			id: "q-steps",
			prompt: "Does this six-step sequence match your stated process?",
			suggestions: [
				"Yes, that matches",
				"Close — Production Plan sometimes informal",
				"We skip Menu Projection",
			],
			field: "name",
			revealsStepIds: ["mp", "mproj", "mr", "pp", "ki", "gi"],
		},
		revealStepIds: ["mp", "mproj", "mr", "pp", "ki", "gi"],
		applyAnswer: (definition, answer) => {
			const skipsProjection = answer.toLowerCase().includes("skip");
			return {
				...definition,
				steps: definition.steps.map((step) => {
					if (skipsProjection && step.id === "mproj") {
						return {
							...step,
							factStatus: "assumed" as const,
							rules: ["Sometimes skipped in practice"],
						};
					}
					return { ...step, factStatus: "confirmed" as const };
				}),
			};
		},
	},
	{
		id: "mr-owner",
		assistantMessages: ["Who is supposed to submit the Menu Requisition?"],
		question: {
			id: "q-mr-role",
			prompt: "Who owns Menu Requisition?",
			suggestions: ["Unit Manager", "Chef Manager", "Menu Planner"],
			stepId: "mr",
			field: "role",
		},
		applyAnswer: (definition, answer) =>
			confirmStep(definition, "mr", {
				role: answer,
				isDemoAssumption: true,
			}),
	},
	{
		id: "mr-deadline",
		assistantMessages: [
			"What's the cut-off you expect for Menu Requisition relative to service day?",
			"I'll treat this as a demo assumption until you confirm it against policy.",
		],
		question: {
			id: "q-mr-deadline",
			prompt: "When should Menu Requisition be submitted?",
			suggestions: ["D-3 by 16:00", "D-3 by 18:00", "D-2 by 16:00"],
			stepId: "mr",
			ruleId: "rule-mr-deadline",
			field: "deadline",
		},
		applyAnswer: (definition, answer) => {
			const { hour, minute, days } = parseDeadline(answer);
			return updateDeadlineRule(definition, hour, minute, days);
		},
	},
	{
		id: "ki-role",
		assistantMessages: ["Who should raise the Kitchen Indent?"],
		question: {
			id: "q-ki-role",
			prompt: "Who owns Kitchen Indent?",
			suggestions: ["Chef Manager", "Unit Manager", "Stores"],
			stepId: "ki",
			ruleId: "rule-ki-role",
			field: "role",
		},
		applyAnswer: (definition, answer) => {
			const withStep = confirmStep(definition, "ki", {
				role: answer,
				isDemoAssumption: true,
			});
			return {
				...withStep,
				rules: withStep.rules.map((rule) =>
					rule.id === "rule-ki-role" && rule.kind === "role"
						? {
								...rule,
								expectedRole: answer,
								label: `Kitchen Indent raised by ${answer}`,
							}
						: rule,
				),
			};
		},
	},
	{
		id: "gi-tolerance",
		assistantMessages: [
			"For Goods Issue versus Production Plan, what variance would you want investigated?",
			"We'll normalise units before comparing — a gap is a signal to look closer, not an automatic error.",
		],
		question: {
			id: "q-gi-tol",
			prompt: "Investigate Goods Issue when it exceeds Production Plan by…",
			suggestions: ["More than 10%", "More than 15%", "More than 20%"],
			stepId: "gi",
			ruleId: "rule-gi-qty",
			field: "rule",
		},
		applyAnswer: (definition, answer) => {
			const pct = answer.includes("10") ? 10 : answer.includes("20") ? 20 : 15;
			return {
				...definition,
				steps: definition.steps.map((step) =>
					step.id === "gi"
						? {
								...step,
								factStatus: "confirmed" as const,
								rules: [
									`Goods Issue within ${pct}% of Production Plan (after UOM normalisation)`,
								],
							}
						: step.id === "pp"
							? { ...step, factStatus: "confirmed" as const }
							: step,
				),
				rules: definition.rules.map((rule) =>
					rule.id === "rule-gi-qty" && rule.kind === "quantityTolerance"
						? {
								...rule,
								tolerancePct: pct,
								label: `Goods Issue within ${pct}% of Production Plan (after UOM normalisation)`,
							}
						: rule,
				),
			};
		},
	},
	{
		id: "wrap",
		assistantMessages: [
			"I have a working picture of how you said this process should run — steps, owners, and a few rules, all marked as demo assumptions where we invented details.",
			"Next we can compare that with the operational records already loaded for this demo and show what needs your attention.",
		],
		revealStepIds: ["mp", "mproj", "mr", "pp", "ki", "gi"],
		applyAnswer: (definition) => ({
			...definition,
			steps: definition.steps.map((step) =>
				step.factStatus === "missing"
					? { ...step, factStatus: "assumed" as const }
					: step,
			),
		}),
	},
];

export const CMP_ENTRY_PROMPTS = [
	{
		id: "describe" as const,
		label: "Describe a process",
		description: "Walk through CMP with guided questions",
	},
	{
		id: "transcript" as const,
		label: "Upload meeting transcript",
		description: "Use a mock ops review transcript",
	},
	{
		id: "document" as const,
		label: "Upload SOP document",
		description: "Start from a mock SOP excerpt",
	},
];
