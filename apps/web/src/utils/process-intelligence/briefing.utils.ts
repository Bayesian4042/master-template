import type {
	Deviation,
	Finding,
	FindingKind,
	FindingSeverity,
	ObservedCase,
	ProcessDefinition,
} from "@/types/operations.types";
import { stepById } from "./observe.utils";

export function classifyDeviation(
	deviation: Deviation,
	definition: ProcessDefinition,
): FindingKind {
	if (deviation.evidenceState === "insufficient_evidence") {
		return "data_quality";
	}
	const rule = definition.rules.find((item) => item.id === deviation.ruleId);
	if (deviation.type === "wrong_role" && rule?.isDemoAssumption !== false) {
		return "knowledge_gap";
	}
	return "process_deviation";
}

export function severityForKind(
	kind: FindingKind,
	impactScore: number,
	caseCount: number,
	total: number,
): FindingSeverity {
	const pct = total === 0 ? 0 : caseCount / total;
	if (kind === "data_quality") return pct >= 0.25 ? "medium" : "low";
	if (kind === "knowledge_gap") {
		if (pct >= 0.5) return "high";
		if (pct >= 0.15) return "medium";
		return "low";
	}
	if (pct >= 0.5 && impactScore >= 70) return "critical";
	if (pct >= 0.25 || impactScore >= 60) return "high";
	if (pct >= 0.1) return "medium";
	return "low";
}

function pluralRole(role: string) {
	if (role.endsWith("s")) return role;
	return `${role}s`;
}

function roleCounts(group: Deviation[], cases: ObservedCase[]) {
	const counts = new Map<string, number>();
	for (const deviation of group) {
		const observed = cases.find((item) => item.caseId === deviation.caseId);
		const event = observed?.events.find((item) =>
			deviation.eventIds.includes(item.id),
		);
		const role = event?.role ?? "an unstated role";
		counts.set(role, (counts.get(role) ?? 0) + 1);
	}
	return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function describeFindingGroup(
	group: Deviation[],
	cases: ObservedCase[],
	definition: ProcessDefinition,
	fallback: { title: string; whyItMatters: string },
) {
	const sample = group[0];
	const step = stepById(definition, sample.stepId);
	const stepName = step?.name ?? sample.stepId;
	const total = cases.length;
	const affected = new Set(group.map((item) => item.caseId)).size;
	const pct = total === 0 ? 0 : Math.round((affected / total) * 1000) / 10;
	const rule = definition.rules.find((item) => item.id === sample.ruleId);

	if (sample.type === "wrong_role" && rule?.kind === "role") {
		const [top] = roleCounts(group, cases);
		const observedRole = top?.[0] ?? "another role";
		return {
			title: `${stepName} ownership differs from the stated process in ${pct}% of cases.`,
			stated: `${stepName} is owned by a ${rule.expectedRole}.`,
			observed: top
				? `${top[1]} of ${total} records identify a ${observedRole}.`
				: sample.observed,
			whyItMatters: rule.isDemoAssumption
				? `The process specifies ${pluralRole(rule.expectedRole)}, but operational records identify ${pluralRole(observedRole)}. Verify whether the process documentation is outdated or responsibilities have changed.`
				: `The confirmed process requires ${pluralRole(rule.expectedRole)}, but records show ${pluralRole(observedRole)}. These cases were carried out by someone other than the intended owner.`,
		};
	}

	if (sample.type === "late" && rule?.kind === "deadline") {
		return {
			title: `${affected} of ${total} ${stepName} records miss the stated cut-off.`,
			stated: rule.label,
			observed: `${affected} arrived after the stated cut-off.`,
			whyItMatters: fallback.whyItMatters,
		};
	}

	if (sample.evidenceState === "insufficient_evidence") {
		return {
			title: fallback.title,
			stated: sample.stated,
			observed: `${affected} of ${total} cases lack enough evidence to judge ${stepName}.`,
			whyItMatters:
				"Missing or unlinked records limit the conclusion. This is a data gap, not a confirmed failure.",
		};
	}

	if (sample.evidenceState === "potential") {
		return {
			title: fallback.title,
			stated: sample.stated,
			observed: `${affected} of ${total} cases show a variance worth checking — not a confirmed fault.`,
			whyItMatters: fallback.whyItMatters,
		};
	}

	return {
		title: fallback.title,
		stated: sample.stated,
		observed: `${affected} of ${total} cases — ${sample.observed}`,
		whyItMatters: fallback.whyItMatters,
	};
}

export function applyKitchenIndentResolution(
	definition: ProcessDefinition,
	choice: "confirm_deviation" | "update_understanding",
): ProcessDefinition {
	const nextRole =
		choice === "update_understanding" ? "Unit Manager" : undefined;

	return {
		...definition,
		steps: definition.steps.map((step) => {
			if (step.id !== "ki") return step;
			return {
				...step,
				role: nextRole ?? step.role,
				factStatus: "confirmed",
				isDemoAssumption: false,
			};
		}),
		rules: definition.rules.map((rule) => {
			if (rule.id !== "rule-ki-role" || rule.kind !== "role") return rule;
			const expectedRole = nextRole ?? rule.expectedRole;
			return {
				...rule,
				expectedRole,
				label: `Kitchen Indent raised by ${expectedRole}`,
				isDemoAssumption: false,
			};
		}),
	};
}

function shortHeadlineLabels(
	lead: Finding,
	cases: ObservedCase[],
	definition: ProcessDefinition,
	deviations: Deviation[],
) {
	const group = deviations.filter((item) =>
		lead.deviationIds.includes(item.id),
	);
	const rule = definition.rules.find((item) => item.id === group[0]?.ruleId);

	if (lead.deviationType === "wrong_role" && rule?.kind === "role") {
		const [top] = roleCounts(group, cases);
		return {
			statedShort: rule.expectedRole,
			observedShort: top ? `${top[0]} (${top[1]})` : lead.observed,
		};
	}

	if (lead.deviationType === "late" && rule?.kind === "deadline") {
		return {
			statedShort: rule.label,
			observedShort: `${lead.affectedCaseIds.length} late`,
		};
	}

	return {
		statedShort: lead.stated,
		observedShort: lead.observed,
	};
}

export function buildHeadline(
	findings: Finding[],
	cases: ObservedCase[],
	deviations: Deviation[],
	definition: ProcessDefinition,
	eventCount: number,
) {
	const lead = findings.find((finding) => finding.kind !== "data_quality");
	const countKind = (kind: FindingKind) =>
		deviations.filter(
			(deviation) => classifyDeviation(deviation, definition) === kind,
		).length;

	if (!lead) {
		return {
			title:
				"No material difference between the stated process and these records.",
			detail:
				"The demo records do not contradict a stated rule. Data gaps, if any, are listed below.",
			action: "Review record quality before drawing an operational conclusion.",
			kind: "data_quality" as const,
			stated: "",
			observed: "",
			statedShort: "",
			observedShort: "",
			findingId: "",
			affectedCases: 0,
			evidenceCount: 0,
			casesAnalysed: cases.length,
			eventsAnalysed: eventCount,
			deviationSignals: countKind("process_deviation"),
			knowledgeGapSignals: countKind("knowledge_gap"),
			dataQualitySignals: countKind("data_quality"),
		};
	}

	const shorts = shortHeadlineLabels(lead, cases, definition, deviations);

	return {
		title: lead.title,
		detail: lead.whyItMatters,
		action: lead.actions[0] ?? "Review the evidence with operations.",
		kind: lead.kind,
		stated: lead.stated,
		observed: lead.observed,
		statedShort: shorts.statedShort,
		observedShort: shorts.observedShort,
		findingId: lead.id,
		affectedCases: lead.affectedCaseIds.length,
		evidenceCount: lead.evidenceEventIds.length,
		casesAnalysed: cases.length,
		eventsAnalysed: eventCount,
		deviationSignals: countKind("process_deviation"),
		knowledgeGapSignals: countKind("knowledge_gap"),
		dataQualitySignals: countKind("data_quality"),
	};
}
