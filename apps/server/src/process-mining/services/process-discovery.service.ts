import { Injectable } from "@nestjs/common";
import { pm4js } from "../pm4js-runtime";
import type { CaseEvent, ProcessGraph } from "../process-mining.types";
import { groupEventsByCase } from "../utils/event-log.utils";
import {
	attachMedianWaits,
	collectTransitionSamples,
	findBottleneck,
} from "../utils/wait-time.utils";

@Injectable()
export class ProcessDiscoveryService {
	discover(events: CaseEvent[]) {
		const graph = this.buildGraph(events);
		const samples = collectTransitionSamples(events);
		const edges = attachMedianWaits(
			graph.edges.map(({ from, to, frequency }) => ({ from, to, frequency })),
			samples,
		);
		const bottleneck = findBottleneck(samples);

		return {
			graph: { nodes: graph.nodes, edges },
			bottleneck,
		};
	}

	private buildGraph(events: CaseEvent[]): ProcessGraph {
		const log = new pm4js.EventLog();
		const byCase = groupEventsByCase(events);

		for (const [caseId, caseEvents] of byCase) {
			const activities = new Set(caseEvents.map((event) => event.activity));
			if (activities.size < 2) continue;

			const trace = new pm4js.Trace();
			trace.attributes["concept:name"] = new pm4js.Attribute(caseId);

			const ordered = [...caseEvents].sort(
				(a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
			);
			for (const event of ordered) {
				const pmEvent = new pm4js.Event();
				pmEvent.attributes["concept:name"] = new pm4js.Attribute(
					event.activity,
				);
				pmEvent.attributes["time:timestamp"] = new pm4js.Attribute(
					event.occurredAt,
				);
				trace.events.push(pmEvent);
			}
			log.traces.push(trace);
		}

		const dfg = pm4js.FrequencyDfgDiscovery.apply(log);
		const nodes = Object.entries(dfg.activities).map(
			([activity, frequency]) => ({
				activity,
				frequency,
			}),
		);
		const edges = Object.entries(dfg.pathsFrequency).map(
			([path, frequency]) => {
				const [from, to] = path.split(",");
				return {
					from,
					to,
					frequency,
					medianWaitHours: null as number | null,
				};
			},
		);

		return { nodes, edges };
	}
}
