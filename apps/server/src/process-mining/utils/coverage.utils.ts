import type {
	CaseEvent,
	CoverageReport,
	DatasetMapping,
	FileCoverage,
	ParsedSheet,
} from "../process-mining.types";
import { isDateOnlyTimestamp, parseTimestamp } from "./cell.utils";
import { buildCaseId, groupEventsByCase } from "./event-log.utils";

export function buildCoverageReport(
	sheets: ParsedSheet[],
	mappings: DatasetMapping[],
	events: CaseEvent[],
): CoverageReport {
	const mappingByFile = new Map(mappings.map((m) => [m.fileName, m]));
	const files: FileCoverage[] = sheets.map((sheet) => {
		const mapping = mappingByFile.get(sheet.fileName);
		let validCaseKeyCount = 0;
		const activityStats = (mapping?.activities ?? []).map((activity) => ({
			name: activity.name,
			validTimestampCount: 0,
			dateOnly: false,
		}));

		for (const row of sheet.rows) {
			if (mapping && buildCaseId(row.values, mapping.caseKeyColumns)) {
				validCaseKeyCount += 1;
			}
			if (!mapping) continue;
			for (const [index, activity] of mapping.activities.entries()) {
				const raw = row.values[activity.timestampColumn] ?? null;
				const parsed = parseTimestamp(raw);
				if (!parsed) continue;
				activityStats[index].validTimestampCount += 1;
				if (isDateOnlyTimestamp(raw, parsed)) {
					activityStats[index].dateOnly = true;
				}
			}
		}

		return {
			fileName: sheet.fileName,
			rowCount: sheet.rows.length,
			validCaseKeyCount,
			activities: activityStats,
		};
	});

	const byCase = groupEventsByCase(events);
	let casesWithTwoOrMoreActivities = 0;
	for (const caseEvents of byCase.values()) {
		const activities = new Set(caseEvents.map((e) => e.activity));
		if (activities.size >= 2) casesWithTwoOrMoreActivities += 1;
	}

	return {
		files,
		casesWithEvents: byCase.size,
		casesWithTwoOrMoreActivities,
	};
}

export function coverageGateReasons(
	coverage: CoverageReport,
	mappings: DatasetMapping[],
): string[] {
	const missing: string[] = [];

	if (mappings.some((m) => m.caseKeyColumns.length === 0)) {
		missing.push("No case key columns were mapped.");
	}

	const totalValidKeys = coverage.files.reduce(
		(sum, file) => sum + file.validCaseKeyCount,
		0,
	);
	if (totalValidKeys === 0) {
		missing.push(
			"No stable case identifier could be built from the mapped key columns.",
		);
	}

	const hasAnyTimestamp = coverage.files.some((file) =>
		file.activities.some((activity) => activity.validTimestampCount > 0),
	);
	if (!hasAnyTimestamp) {
		missing.push(
			"No usable activity timestamps were found. A dated record alone is not enough.",
		);
	}

	if (coverage.casesWithTwoOrMoreActivities === 0) {
		missing.push(
			"No case has two or more timestamped activities, so a process graph cannot be discovered.",
		);
	}

	return missing;
}
