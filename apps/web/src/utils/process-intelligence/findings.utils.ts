import { getNarrative } from "@/constants/templates/cmp";
import type {
	Bottleneck,
	Deviation,
	Finding,
	Kpi,
	ObservedCase,
	ProcessDefinition,
	StepAdherence,
} from "@/types/operations.types";
import {
	classifyDeviation,
	describeFindingGroup,
	severityForKind,
} from "./briefing.utils";
import { eventsForStep, median } from "./observe.utils";

export function deriveFindings(
	deviations: Deviation[],
	cases: ObservedCase[],
	definition: ProcessDefinition,
): Finding[] {
	const groups = new Map<string, Deviation[]>();
	for (const deviation of deviations) {
		const key = `${deviation.type}:${deviation.stepId}:${deviation.evidenceState}`;
		const list = groups.get(key) ?? [];
		list.push(deviation);
		groups.set(key, list);
	}

	const totalCases = cases.length;
	const findings: Finding[] = [];

	for (const [key, group] of groups) {
		const sample = group[0];
		const narrative = getNarrative(sample.type, sample.stepId);
		const affectedCaseIds = [...new Set(group.map((d) => d.caseId))];
		const evidenceEventIds = [...new Set(group.flatMap((d) => d.eventIds))];
		const avgImpact =
			group.reduce((sum, d) => sum + d.impactScore, 0) / group.length;
		const costImpact = group.reduce((sum, d) => sum + (d.costImpact ?? 0), 0);
		const kind = classifyDeviation(sample, definition);
		const described = describeFindingGroup(group, cases, definition, narrative);

		findings.push({
			id: `finding-${key}`,
			title: described.title,
			kind,
			severity: severityForKind(
				kind,
				avgImpact,
				affectedCaseIds.length,
				totalCases,
			),
			evidenceState: sample.evidenceState,
			stepId: sample.stepId,
			deviationType: sample.type,
			stated: described.stated,
			observed: described.observed,
			whyItMatters: described.whyItMatters,
			explanations: narrative.explanations,
			actions: narrative.actions,
			affectedCaseIds,
			evidenceEventIds,
			deviationIds: group.map((d) => d.id),
			impactScore: avgImpact,
			costImpact: costImpact > 0 ? costImpact : undefined,
			percentageOfCases:
				totalCases === 0
					? 0
					: Math.round((affectedCaseIds.length / totalCases) * 1000) / 10,
			denominator: totalCases,
		});
	}

	const kindOrder: Record<Finding["kind"], number> = {
		knowledge_gap: 0,
		process_deviation: 1,
		data_quality: 2,
	};

	return findings.sort((a, b) => {
		const byReach = b.affectedCaseIds.length - a.affectedCaseIds.length;
		if (
			a.kind !== "data_quality" &&
			b.kind !== "data_quality" &&
			byReach !== 0
		) {
			return byReach;
		}
		const byKind = kindOrder[a.kind] - kindOrder[b.kind];
		if (byKind !== 0) return byKind;
		return byReach;
	});
}

export function deriveKpis(
	definition: ProcessDefinition,
	cases: ObservedCase[],
	deviations: Deviation[],
): Kpi[] {
	const total = cases.length;
	const confirmed = deviations.filter((d) => d.evidenceState === "confirmed");

	const mrDeadline = definition.rules.find(
		(r) => r.kind === "deadline" && r.stepId === "mr",
	);
	const lateMr = confirmed.filter(
		(d) => d.type === "late" && d.stepId === "mr",
	);
	const onTimeMrPct =
		total === 0 ? 0 : Math.round(((total - lateMr.length) / total) * 1000) / 10;

	const qty = deviations.filter(
		(d) => d.type === "quantity_variance" && d.evidenceState === "potential",
	);
	const qtyCost = qty.reduce((sum, d) => sum + (d.costImpact ?? 0), 0);

	const roleRule = definition.rules.find(
		(rule) => rule.kind === "role" && rule.stepId === "ki",
	);
	const roleMismatches = confirmed.filter(
		(deviation) => deviation.type === "wrong_role" && deviation.stepId === "ki",
	);
	const weakCases = new Set(
		deviations
			.filter(
				(deviation) => deviation.evidenceState === "insufficient_evidence",
			)
			.map((deviation) => deviation.caseId),
	);

	return [
		{
			id: "ownership",
			label: "Indent ownership differs",
			value: `${roleMismatches.length}/${total}`,
			hint: roleRule
				? `Stated owner: ${roleRule.kind === "role" ? roleRule.expectedRole : "role"}`
				: "Compared with the stated owner",
			tone: roleMismatches.length > total / 2 ? "warn" : "neutral",
		},
		{
			id: "on-time-mr",
			label: mrDeadline
				? `On time vs ${mrDeadline.label}`
				: "Requisitions on time",
			value: `${total - lateMr.length}/${total}`,
			hint: mrDeadline
				? `Against ${mrDeadline.label}`
				: "Against the stated cut-off",
			tone: onTimeMrPct >= 90 ? "good" : onTimeMrPct >= 70 ? "warn" : "bad",
		},
		{
			id: "qty-flag",
			label: "Quantity signals",
			value: String(qty.length),
			observed:
				qtyCost > 0
					? `~₹${qtyCost.toLocaleString("en-IN")} cost delta`
					: undefined,
			hint: "Worth checking — not confirmed faults",
			tone: qty.length > 0 ? "warn" : "good",
		},
		{
			id: "weak-evidence",
			label: "Cases with weak evidence",
			value: String(weakCases.size),
			hint: "Missing records or timestamps",
			tone: "neutral",
		},
	];
}

export function deriveStepAdherence(
	definition: ProcessDefinition,
	cases: ObservedCase[],
	deviations: Deviation[],
): StepAdherence[] {
	return definition.steps
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((step) => {
			let confirmedOk = 0;
			let confirmedDeviation = 0;
			let potential = 0;
			let insufficient = 0;

			for (const observed of cases) {
				const stepDevs = deviations.filter(
					(d) => d.caseId === observed.caseId && d.stepId === step.id,
				);
				if (stepDevs.some((d) => d.evidenceState === "confirmed")) {
					confirmedDeviation += 1;
				} else if (stepDevs.some((d) => d.evidenceState === "potential")) {
					potential += 1;
				} else if (
					stepDevs.some((d) => d.evidenceState === "insufficient_evidence")
				) {
					insufficient += 1;
				} else {
					confirmedOk += 1;
				}
			}

			const totalCases = cases.length;
			const adherencePct =
				totalCases === 0
					? 0
					: Math.round((confirmedOk / totalCases) * 1000) / 10;

			return {
				stepId: step.id,
				stepName: step.name,
				confirmedOk,
				confirmedDeviation,
				potential,
				insufficient,
				totalCases,
				adherencePct,
			};
		});
}

export function deriveBottlenecks(
	definition: ProcessDefinition,
	cases: ObservedCase[],
): Bottleneck[] {
	const ordered = definition.steps.slice().sort((a, b) => a.order - b.order);
	const bottlenecks: Bottleneck[] = [];

	for (let i = 0; i < ordered.length - 1; i += 1) {
		const from = ordered[i];
		const to = ordered[i + 1];
		const waits: number[] = [];
		for (const observed of cases) {
			const fromEvent = eventsForStep(observed, from.id)[0];
			const toEvent = eventsForStep(observed, to.id)[0];
			if (!fromEvent?.timestamp || !toEvent?.timestamp) continue;
			const hours =
				(new Date(toEvent.timestamp).getTime() -
					new Date(fromEvent.timestamp).getTime()) /
				3_600_000;
			if (hours >= 0) waits.push(hours);
		}
		const med = median(waits);
		if (med === null) continue;
		bottlenecks.push({
			fromStepId: from.id,
			toStepId: to.id,
			label: `${from.name} → ${to.name}`,
			medianHours: Math.round(med * 10) / 10,
		});
	}

	return bottlenecks;
}
