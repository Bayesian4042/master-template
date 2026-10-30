import { describe, expect, it } from "vitest";
import type { CaseEvent } from "../../src/process-mining/process-mining.types";
import {
	collectTransitionSamples,
	findBottleneck,
} from "../../src/process-mining/utils/wait-time.utils";

function event(
	caseId: string,
	activity: string,
	iso: string,
	fileName = "file.xlsx",
): CaseEvent {
	return {
		caseId,
		activity,
		occurredAt: new Date(iso),
		fileName,
		rowNumbers: [2],
	};
}

describe("wait-time utils", () => {
	it("computes exact median waits and picks the longest transition", () => {
		const events: CaseEvent[] = [
			event("c1", "MP", "2024-01-01T00:00:00.000Z"),
			event("c1", "MR", "2024-01-02T00:00:00.000Z"),
			event("c1", "PP", "2024-01-04T00:00:00.000Z"),
			event("c2", "MP", "2024-01-01T00:00:00.000Z"),
			event("c2", "MR", "2024-01-02T12:00:00.000Z"),
			event("c2", "PP", "2024-01-05T12:00:00.000Z"),
			event("c3", "MP", "2024-01-01T00:00:00.000Z"),
			event("c3", "MR", "2024-01-01T12:00:00.000Z"),
			event("c3", "PP", "2024-01-03T12:00:00.000Z"),
		];

		const samples = collectTransitionSamples(events);
		const mpMr = samples.get("MP|MR")?.map((s) => s.waitHours).sort((a, b) => a - b);
		const mrPp = samples.get("MR|PP")?.map((s) => s.waitHours).sort((a, b) => a - b);

		expect(mpMr).toEqual([12, 24, 36]);
		expect(mrPp).toEqual([48, 48, 72]);

		const bottleneck = findBottleneck(samples);
		expect(bottleneck?.from).toBe("MR");
		expect(bottleneck?.to).toBe("PP");
		expect(bottleneck?.medianWaitHours).toBe(48);
		expect(bottleneck?.caseCount).toBe(3);
		expect(bottleneck?.lowSample).toBe(true);
		expect(bottleneck?.evidence[0]?.caseId).toBe("c2");
	});
});
