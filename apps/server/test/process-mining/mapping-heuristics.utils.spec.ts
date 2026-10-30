import { describe, expect, it } from "vitest";
import type { ParsedSheet } from "../../src/process-mining/process-mining.types";
import { suggestMappingFromHeaders } from "../../src/process-mining/utils/mapping-heuristics.utils";

describe("suggestMappingFromHeaders", () => {
	it("maps fixture-style MP headers", () => {
		const sheet: ParsedSheet = {
			fileName: "mp.xlsx",
			sheetName: "Sheet1",
			headers: ["Location", "Svc Date", "Meal Type", "MP Submitted", "Owner"],
			rows: [],
		};

		expect(suggestMappingFromHeaders(sheet)).toEqual({
			fileName: "mp.xlsx",
			caseKeyColumns: ["Location", "Svc Date", "Meal Type"],
			activities: [
				{ name: "Menu Projection", timestampColumn: "MP Submitted" },
			],
			actorColumn: "Owner",
		});
	});
});
