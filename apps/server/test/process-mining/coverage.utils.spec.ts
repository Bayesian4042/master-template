import { describe, expect, it } from "vitest";
import type {
	DatasetMapping,
	ParsedSheet,
} from "../../src/process-mining/process-mining.types";
import {
	buildCoverageReport,
	coverageGateReasons,
} from "../../src/process-mining/utils/coverage.utils";
import { buildCaseEvents } from "../../src/process-mining/utils/event-log.utils";

describe("coverageGateReasons", () => {
	it("returns insufficient evidence when there is no common key", () => {
		const mappings: DatasetMapping[] = [
			{
				fileName: "mp.xlsx",
				caseKeyColumns: ["Missing Key"],
				activities: [{ name: "Menu Projection", timestampColumn: "Submitted At" }],
			},
		];
		const sheets: ParsedSheet[] = [
			{
				fileName: "mp.xlsx",
				sheetName: "Sheet1",
				headers: ["Site", "Submitted At"],
				rows: [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Submitted At": "10/01/2024 09:00",
						},
					},
				],
			},
		];

		const events = buildCaseEvents(sheets, mappings);
		const coverage = buildCoverageReport(sheets, mappings, events);
		const missing = coverageGateReasons(coverage, mappings);

		expect(events).toHaveLength(0);
		expect(missing.some((reason) => /case identifier/i.test(reason))).toBe(
			true,
		);
		expect(
			missing.some((reason) => /two or more timestamped activities/i.test(reason)),
		).toBe(true);
	});
});
