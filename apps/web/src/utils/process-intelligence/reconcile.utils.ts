import type {
	CaseEvent,
	IntelligenceResult,
	ProcessDefinition,
} from "@/types/operations.types";
import { buildHeadline } from "./briefing.utils";
import { deriveDataQualityIssues } from "./data-quality.utils";
import { detectDeviations } from "./deviations.utils";
import {
	deriveBottlenecks,
	deriveFindings,
	deriveKpis,
	deriveStepAdherence,
} from "./findings.utils";
import { buildObservedCases } from "./observe.utils";

export function reconcileProcess(
	definition: ProcessDefinition,
	events: CaseEvent[],
	serviceDates: Record<string, string>,
): IntelligenceResult {
	const cases = buildObservedCases(events, serviceDates);
	const deviations = detectDeviations(definition, cases);
	const findings = deriveFindings(deviations, cases, definition);
	const kpis = deriveKpis(definition, cases, deviations);
	const stepAdherence = deriveStepAdherence(definition, cases, deviations);
	const bottlenecks = deriveBottlenecks(definition, cases);
	const dataQuality = deriveDataQualityIssues(events);
	const headline = buildHeadline(
		findings,
		cases,
		deviations,
		definition,
		events.length,
	);

	return {
		cases,
		deviations,
		findings,
		kpis,
		stepAdherence,
		bottlenecks,
		dataQuality,
		headline,
	};
}
