import { describe, expect, it } from "vitest";
import type {
	DatasetMapping,
	ParsedSheet,
} from "../../src/process-mining/process-mining.types";
import { buildCaseEvents } from "../../src/process-mining/utils/event-log.utils";

const mappings: DatasetMapping[] = [
	{
		fileName: "mp.xlsx",
		caseKeyColumns: ["Site", "Service Date", "Meal"],
		activities: [{ name: "Menu Projection", timestampColumn: "Submitted At" }],
	},
	{
		fileName: "mr.xlsx",
		caseKeyColumns: ["Site", "Service Date", "Meal"],
		activities: [{ name: "Menu Requisition", timestampColumn: "Submitted At" }],
	},
	{
		fileName: "pp.xlsx",
		caseKeyColumns: ["Site", "Service Date", "Meal"],
		activities: [{ name: "Production Plan", timestampColumn: "Created At" }],
	},
];

function sheet(
	fileName: string,
	rows: { rowNumber: number; values: Record<string, string | Date | null> }[],
): ParsedSheet {
	return {
		fileName,
		sheetName: "Sheet1",
		headers: Object.keys(rows[0]?.values ?? {}),
		rows,
	};
}

describe("buildCaseEvents", () => {
	it("builds a normal MP → MR → PP case", () => {
		const events = buildCaseEvents(
			[
				sheet("mp.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "10/01/2024 09:00",
						},
					},
				]),
				sheet("mr.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "12/01/2024 09:00",
						},
					},
				]),
				sheet("pp.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Created At": "14/01/2024 09:00",
						},
					},
				]),
			],
			mappings,
		);

		expect(events).toHaveLength(3);
		expect(events.map((e) => e.activity)).toEqual([
			"Menu Projection",
			"Menu Requisition",
			"Production Plan",
		]);
		expect(events[0].caseId).toBe("a|2024-01-15|lunch");
	});

	it("dedupes item lines into one event with multiple row numbers", () => {
		const events = buildCaseEvents(
			[
				sheet("mr.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "12/01/2024 09:00",
							Item: "Rice",
						},
					},
					{
						rowNumber: 3,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "12/01/2024 09:00",
							Item: "Dal",
						},
					},
				]),
			],
			[mappings[1]],
		);

		expect(events).toHaveLength(1);
		expect(events[0].rowNumbers).toEqual([2, 3]);
	});

	it("keeps unmatched MP case without inventing PP", () => {
		const events = buildCaseEvents(
			[
				sheet("mp.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "10/01/2024 09:00",
						},
					},
				]),
				sheet("pp.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "B",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Created At": "14/01/2024 09:00",
						},
					},
				]),
			],
			[mappings[0], mappings[2]],
		);

		expect(events.map((e) => e.caseId).sort()).toEqual([
			"a|2024-01-15|lunch",
			"b|2024-01-15|lunch",
		]);
		expect(events.find((e) => e.caseId.startsWith("a|"))?.activity).toBe(
			"Menu Projection",
		);
	});

	it("skips malformed dates", () => {
		const events = buildCaseEvents(
			[
				sheet("mp.xlsx", [
					{
						rowNumber: 2,
						values: {
							Site: "A",
							"Service Date": "15/01/2024",
							Meal: "Lunch",
							"Submitted At": "not-a-date",
						},
					},
				]),
			],
			[mappings[0]],
		);

		expect(events).toHaveLength(0);
	});
});
