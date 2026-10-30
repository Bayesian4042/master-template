import {
	BOTTLENECK_LOW_SAMPLE_THRESHOLD,
	MS_PER_HOUR,
} from "../process-mining.constants";
import type {
	BottleneckEvidence,
	BottleneckFinding,
	CaseEvent,
	ProcessGraphEdge,
} from "../process-mining.types";
import { groupEventsByCase } from "./event-log.utils";

function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[mid - 1] + sorted[mid]) / 2;
	}
	return sorted[mid];
}

function toSourceRef(event: CaseEvent) {
	return {
		timestamp: event.occurredAt.toISOString(),
		fileName: event.fileName,
		rowNumbers: [...event.rowNumbers],
		actor: event.actor,
	};
}

type TransitionSample = {
	caseId: string;
	waitHours: number;
	fromEvent: CaseEvent;
	toEvent: CaseEvent;
};

export function collectTransitionSamples(
	events: CaseEvent[],
): Map<string, TransitionSample[]> {
	const byCase = groupEventsByCase(events);
	const samples = new Map<string, TransitionSample[]>();

	for (const [caseId, caseEvents] of byCase) {
		const ordered = [...caseEvents].sort(
			(a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
		);
		for (let i = 0; i < ordered.length - 1; i += 1) {
			const fromEvent = ordered[i];
			const toEvent = ordered[i + 1];
			if (fromEvent.activity === toEvent.activity) continue;
			const waitMs =
				toEvent.occurredAt.getTime() - fromEvent.occurredAt.getTime();
			if (waitMs < 0) continue;
			const key = `${fromEvent.activity}|${toEvent.activity}`;
			const list = samples.get(key) ?? [];
			list.push({
				caseId,
				waitHours: waitMs / MS_PER_HOUR,
				fromEvent,
				toEvent,
			});
			samples.set(key, list);
		}
	}

	return samples;
}

export function attachMedianWaits(
	edges: Omit<ProcessGraphEdge, "medianWaitHours">[],
	samples: Map<string, TransitionSample[]>,
): ProcessGraphEdge[] {
	return edges.map((edge) => {
		const key = `${edge.from}|${edge.to}`;
		const waits = (samples.get(key) ?? []).map((sample) => sample.waitHours);
		return {
			...edge,
			medianWaitHours: median(waits),
		};
	});
}

export function findBottleneck(
	samples: Map<string, TransitionSample[]>,
): BottleneckFinding | undefined {
	let best: BottleneckFinding | undefined;

	for (const [key, list] of samples) {
		if (list.length === 0) continue;
		const [from, to] = key.split("|");
		const medianWaitHours = median(list.map((sample) => sample.waitHours));
		if (medianWaitHours === null) continue;

		const evidence: BottleneckEvidence[] = [...list]
			.sort((a, b) => b.waitHours - a.waitHours)
			.slice(0, 25)
			.map((sample) => ({
				caseId: sample.caseId,
				waitHours: Number(sample.waitHours.toFixed(2)),
				fromEvent: toSourceRef(sample.fromEvent),
				toEvent: toSourceRef(sample.toEvent),
			}));

		const candidate: BottleneckFinding = {
			from,
			to,
			medianWaitHours: Number(medianWaitHours.toFixed(2)),
			caseCount: list.length,
			lowSample: list.length < BOTTLENECK_LOW_SAMPLE_THRESHOLD,
			evidence,
		};

		if (
			!best ||
			candidate.medianWaitHours > best.medianWaitHours ||
			(candidate.medianWaitHours === best.medianWaitHours &&
				candidate.caseCount > best.caseCount)
		) {
			best = candidate;
		}
	}

	return best;
}
