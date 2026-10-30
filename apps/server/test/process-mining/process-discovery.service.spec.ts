import { describe, expect, it } from "vitest";
import type { CaseEvent } from "../../src/process-mining/process-mining.types";
import { ProcessDiscoveryService } from "../../src/process-mining/services/process-discovery.service";

describe("ProcessDiscoveryService", () => {
	it("discovers a DFG with frequencies and median waits", () => {
		const service = new ProcessDiscoveryService();
		const events: CaseEvent[] = [
			{
				caseId: "c1",
				activity: "MP",
				occurredAt: new Date("2024-01-01T00:00:00.000Z"),
				fileName: "mp.xlsx",
				rowNumbers: [2],
			},
			{
				caseId: "c1",
				activity: "MR",
				occurredAt: new Date("2024-01-02T00:00:00.000Z"),
				fileName: "mr.xlsx",
				rowNumbers: [2],
			},
			{
				caseId: "c1",
				activity: "PP",
				occurredAt: new Date("2024-01-04T00:00:00.000Z"),
				fileName: "pp.xlsx",
				rowNumbers: [2],
			},
		];

		const result = service.discover(events);
		expect(result.graph.nodes.map((n) => n.activity).sort()).toEqual([
			"MP",
			"MR",
			"PP",
		]);
		expect(result.graph.edges).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					from: "MP",
					to: "MR",
					frequency: 1,
					medianWaitHours: 24,
				}),
				expect.objectContaining({
					from: "MR",
					to: "PP",
					frequency: 1,
					medianWaitHours: 48,
				}),
			]),
		);
		expect(result.bottleneck?.from).toBe("MR");
		expect(result.bottleneck?.to).toBe("PP");
	});
});
