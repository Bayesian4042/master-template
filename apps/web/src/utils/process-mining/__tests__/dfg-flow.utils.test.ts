import { describe, expect, it } from "vitest";
import { graphToFlow } from "../dfg-flow.utils";

describe("graphToFlow", () => {
	it("layouts nodes and marks the bottleneck edge", () => {
		const { nodes, edges } = graphToFlow(
			{
				nodes: [
					{ activity: "MP", frequency: 2 },
					{ activity: "MR", frequency: 2 },
					{ activity: "PP", frequency: 2 },
				],
				edges: [
					{ from: "MP", to: "MR", frequency: 2, medianWaitHours: 18 },
					{ from: "MR", to: "PP", frequency: 2, medianWaitHours: 42 },
				],
			},
			{
				from: "MR",
				to: "PP",
				medianWaitHours: 42,
				caseCount: 2,
				lowSample: true,
				evidence: [],
			},
		);

		expect(nodes).toHaveLength(3);
		expect(nodes.every((node) => Number.isFinite(node.position.x))).toBe(true);
		const bottleneck = edges.find((edge) => edge.id === "MR-PP");
		expect(bottleneck?.data?.isBottleneck).toBe(true);
		expect(bottleneck?.label).toBe("2x · 42h");
	});
});
