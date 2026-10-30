import type {
	ConformanceRule,
	Deviation,
	ObservedCase,
	ProcessDefinition,
} from "@/types/operations.types";
import { eventsForStep, stepById } from "./observe.utils";
import { quantityVariancePct } from "./uom.utils";

function deadlineIso(
	serviceDate: string,
	rule: Extract<ConformanceRule, { kind: "deadline" }>,
) {
	const d = new Date(
		`${serviceDate}T${String(rule.hour).padStart(2, "0")}:${String(rule.minute).padStart(2, "0")}:00`,
	);
	d.setDate(d.getDate() - rule.daysBeforeService);
	return d;
}

function detectDeadline(
	observed: ObservedCase,
	rule: Extract<ConformanceRule, { kind: "deadline" }>,
	definition: ProcessDefinition,
): Deviation | null {
	const step = stepById(definition, rule.stepId);
	const stepEvents = eventsForStep(observed, rule.stepId);
	if (stepEvents.length === 0) {
		return {
			id: `${observed.caseId}-${rule.id}-missing`,
			type: "missing_step",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [],
			stated: rule.label,
			observed: `No ${step?.name ?? rule.stepId} record linked to this case`,
			impactScore: 40,
		};
	}

	const event = stepEvents[0];
	if (!event.timestamp) {
		return {
			id: `${observed.caseId}-${rule.id}-no-ts`,
			type: "late",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [event.id],
			stated: rule.label,
			observed: "Timestamp missing on the source record",
			impactScore: 20,
		};
	}

	const cutOff = deadlineIso(observed.serviceDate, rule);
	const actual = new Date(event.timestamp);
	if (actual <= cutOff) return null;

	const delayHours = (actual.getTime() - cutOff.getTime()) / 3_600_000;
	return {
		id: `${observed.caseId}-${rule.id}-late`,
		type: "late",
		evidenceState: "confirmed",
		stepId: rule.stepId,
		caseId: observed.caseId,
		ruleId: rule.id,
		eventIds: [event.id],
		stated: rule.label,
		observed: `Recorded at ${actual.toISOString()} (${delayHours.toFixed(1)}h after cut-off)`,
		impactScore: Math.min(100, 50 + delayHours),
		delayHours,
	};
}

function detectRole(
	observed: ObservedCase,
	rule: Extract<ConformanceRule, { kind: "role" }>,
): Deviation | null {
	const stepEvents = eventsForStep(observed, rule.stepId);
	if (stepEvents.length === 0) {
		return {
			id: `${observed.caseId}-${rule.id}-missing`,
			type: "missing_step",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [],
			stated: rule.label,
			observed: "No record linked to this case",
			impactScore: 35,
		};
	}

	const event = stepEvents[0];
	if (!event.role) {
		return {
			id: `${observed.caseId}-${rule.id}-no-role`,
			type: "wrong_role",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [event.id],
			stated: rule.label,
			observed: "Role missing on the source record",
			impactScore: 25,
		};
	}

	if (event.role === rule.expectedRole) return null;

	return {
		id: `${observed.caseId}-${rule.id}-role`,
		type: "wrong_role",
		evidenceState: "confirmed",
		stepId: rule.stepId,
		caseId: observed.caseId,
		ruleId: rule.id,
		eventIds: [event.id],
		stated: rule.label,
		observed: `Performed by ${event.role}${event.actor ? ` (${event.actor})` : ""}`,
		impactScore: 55,
	};
}

function detectSequence(
	observed: ObservedCase,
	rule: Extract<ConformanceRule, { kind: "sequence" }>,
	definition: ProcessDefinition,
): Deviation | null {
	const step = stepById(definition, rule.stepId);
	const stepEvents = eventsForStep(observed, rule.stepId);
	const requiredEvents = eventsForStep(observed, rule.requiresStepId);

	if (stepEvents.length === 0) {
		return {
			id: `${observed.caseId}-${rule.id}-missing`,
			type: "missing_step",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: requiredEvents.map((e) => e.id),
			stated: rule.label,
			observed: `No ${step?.name ?? rule.stepId} record found — may be skipped, not uploaded, or not linked`,
			impactScore: 60,
		};
	}

	if (requiredEvents.length === 0) return null;

	const stepTs = stepEvents[0].timestamp;
	const reqTs = requiredEvents[0].timestamp;
	if (!stepTs || !reqTs) {
		return {
			id: `${observed.caseId}-${rule.id}-order-unknown`,
			type: "sequence",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [...stepEvents, ...requiredEvents].map((e) => e.id),
			stated: rule.label,
			observed: "One or both timestamps missing — order cannot be confirmed",
			impactScore: 20,
		};
	}

	if (new Date(stepTs) >= new Date(reqTs)) return null;

	return {
		id: `${observed.caseId}-${rule.id}-order`,
		type: "sequence",
		evidenceState: "potential",
		stepId: rule.stepId,
		caseId: observed.caseId,
		ruleId: rule.id,
		eventIds: [...stepEvents, ...requiredEvents].map((e) => e.id),
		stated: rule.label,
		observed: "Timestamps suggest this step occurred before its prerequisite",
		impactScore: 45,
	};
}

function detectQuantity(
	observed: ObservedCase,
	rule: Extract<ConformanceRule, { kind: "quantityTolerance" }>,
): Deviation | null {
	const actualEvents = eventsForStep(observed, rule.stepId);
	const expectedEvents = eventsForStep(observed, rule.compareToStepId);

	if (actualEvents.length === 0 || expectedEvents.length === 0) {
		return {
			id: `${observed.caseId}-${rule.id}-missing`,
			type: "quantity_variance",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [...actualEvents, ...expectedEvents].map((e) => e.id),
			stated: rule.label,
			observed:
				"One of the compared records is missing — variance cannot be assessed",
			impactScore: 30,
		};
	}

	const actual = actualEvents[0];
	const expected = expectedEvents[0];
	const actualQty = actual.values.quantity;
	const expectedQty = expected.values.quantity;
	const actualUnit = actual.values.unit;
	const expectedUnit = expected.values.unit;

	if (
		actualQty === undefined ||
		expectedQty === undefined ||
		!actualUnit ||
		!expectedUnit
	) {
		return {
			id: `${observed.caseId}-${rule.id}-incomplete`,
			type: "quantity_variance",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [actual.id, expected.id],
			stated: rule.label,
			observed: "Quantity or unit of measure missing on one of the records",
			impactScore: 25,
		};
	}

	const variance = quantityVariancePct(
		actualQty,
		actualUnit,
		expectedQty,
		expectedUnit,
	);

	if (variance === null) {
		return {
			id: `${observed.caseId}-${rule.id}-uom`,
			type: "quantity_variance",
			evidenceState: "insufficient_evidence",
			stepId: rule.stepId,
			caseId: observed.caseId,
			ruleId: rule.id,
			eventIds: [actual.id, expected.id],
			stated: rule.label,
			observed: "Units of measure are incompatible after normalisation",
			impactScore: 30,
		};
	}

	if (Math.abs(variance) <= rule.tolerancePct) return null;

	const costImpact =
		actual.values.cost !== undefined && expected.values.cost !== undefined
			? Math.max(0, actual.values.cost - expected.values.cost)
			: actual.values.cost !== undefined
				? Math.round(actual.values.cost * (Math.abs(variance) / 100))
				: undefined;

	return {
		id: `${observed.caseId}-${rule.id}-qty`,
		type: "quantity_variance",
		evidenceState: "potential",
		stepId: rule.stepId,
		caseId: observed.caseId,
		ruleId: rule.id,
		eventIds: [actual.id, expected.id],
		stated: rule.label,
		observed: `Normalised variance ${variance > 0 ? "+" : ""}${variance.toFixed(1)}% — investigate, not auto-fault`,
		impactScore: Math.min(100, 40 + Math.abs(variance)),
		variancePct: variance,
		costImpact,
	};
}

function detectMissingSteps(
	observed: ObservedCase,
	definition: ProcessDefinition,
	alreadyCovered: Set<string>,
): Deviation[] {
	const deviations: Deviation[] = [];
	for (const step of definition.steps) {
		if (!step.dataset) continue;
		const key = `${observed.caseId}:${step.id}`;
		if (alreadyCovered.has(key)) continue;
		const stepEvents = eventsForStep(observed, step.id);
		if (stepEvents.length > 0) continue;
		deviations.push({
			id: `${observed.caseId}-${step.id}-absent`,
			type: "missing_step",
			evidenceState: "insufficient_evidence",
			stepId: step.id,
			caseId: observed.caseId,
			eventIds: [],
			stated: `${step.name} should occur in the stated process`,
			observed:
				"No linked record found — may be skipped, not uploaded, or not linked",
			impactScore: 50,
		});
	}
	return deviations;
}

export function detectDeviations(
	definition: ProcessDefinition,
	cases: ObservedCase[],
): Deviation[] {
	const deviations: Deviation[] = [];

	for (const observed of cases) {
		const covered = new Set<string>();
		for (const rule of definition.rules) {
			let found: Deviation | null = null;
			if (rule.kind === "deadline") {
				found = detectDeadline(observed, rule, definition);
			} else if (rule.kind === "role") {
				found = detectRole(observed, rule);
			} else if (rule.kind === "sequence") {
				found = detectSequence(observed, rule, definition);
			} else if (rule.kind === "quantityTolerance") {
				found = detectQuantity(observed, rule);
			}
			if (found) {
				deviations.push(found);
				covered.add(`${observed.caseId}:${found.stepId}`);
			}
		}
		deviations.push(...detectMissingSteps(observed, definition, covered));
	}

	return deviations;
}
