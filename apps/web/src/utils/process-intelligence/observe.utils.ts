import type {
	CaseEvent,
	ObservedCase,
	ProcessDefinition,
} from "@/types/operations.types";

export function buildObservedCases(
	events: CaseEvent[],
	serviceDates: Record<string, string>,
): ObservedCase[] {
	const byCase = new Map<string, CaseEvent[]>();
	for (const event of events) {
		const list = byCase.get(event.caseId) ?? [];
		list.push(event);
		byCase.set(event.caseId, list);
	}

	return [...byCase.entries()]
		.map(([caseId, caseEvents]) => {
			const first = caseEvents[0];
			const sorted = [...caseEvents].sort((a, b) => {
				if (!a.timestamp && !b.timestamp) return 0;
				if (!a.timestamp) return 1;
				if (!b.timestamp) return -1;
				return a.timestamp.localeCompare(b.timestamp);
			});
			return {
				caseId,
				siteId: first.siteId,
				siteName: first.siteName,
				weekLabel: first.weekLabel,
				serviceDate:
					serviceDates[caseId] ?? sorted[0]?.timestamp?.slice(0, 10) ?? "",
				events: sorted,
			};
		})
		.sort((a, b) => a.caseId.localeCompare(b.caseId));
}

export function eventsForStep(observed: ObservedCase, stepId: string) {
	return observed.events.filter((event) => event.activityId === stepId);
}

export function stepById(definition: ProcessDefinition, stepId: string) {
	return definition.steps.find((step) => step.id === stepId);
}

export function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[mid - 1] + sorted[mid]) / 2;
	}
	return sorted[mid];
}
