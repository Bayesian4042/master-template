import type { DatasetMapping, ParsedSheet } from "../process-mining.types";

const CASE_KEY_PATTERNS = [
	/^(location|site|site[_\s-]?id|site[_\s-]?name)$/i,
	/^(svc|service)[_\s-]?(date|dt|day)$/i,
	/^(meal|meal[_\s-]?type|meal[_\s-]?period)$/i,
];

const TIMESTAMP_PATTERNS = [
	/(submitted|created|approved|timestamp|occurred|updated).*(at|on|date|time)?$/i,
	/^(submitted|created|approved)[_\s-]?(at|on|date|time)?$/i,
	/[_\s-](at|on|time)$/i,
];

const ACTOR_PATTERNS = [
	/^(owner|actor|planner|role|submitted[_\s-]?by|created[_\s-]?by)$/i,
];

const ACTIVITY_BY_FILE = [
	{ match: /mp|projection/i, name: "Menu Projection" },
	{ match: /mr|requisition/i, name: "Menu Requisition" },
	{ match: /pp|production/i, name: "Production Plan" },
];

function pickFirst(headers: string[], patterns: RegExp[]): string | undefined {
	for (const pattern of patterns) {
		const hit = headers.find((header) => pattern.test(header));
		if (hit) return hit;
	}
	return undefined;
}

function pickCaseKeys(headers: string[]): string[] {
	const keys: string[] = [];
	for (const pattern of CASE_KEY_PATTERNS) {
		const hit = headers.find(
			(header) => pattern.test(header) && !keys.includes(header),
		);
		if (hit) keys.push(hit);
	}
	return keys;
}

function activityNameForFile(fileName: string, fallback: string): string {
	for (const rule of ACTIVITY_BY_FILE) {
		if (rule.match.test(fileName)) return rule.name;
	}
	return fallback;
}

export function suggestMappingFromHeaders(sheet: ParsedSheet): DatasetMapping {
	const caseKeyColumns = pickCaseKeys(sheet.headers);
	const timestampColumn = pickFirst(sheet.headers, TIMESTAMP_PATTERNS);
	const actorColumn = pickFirst(sheet.headers, ACTOR_PATTERNS);
	const activityName = activityNameForFile(
		sheet.fileName,
		sheet.sheetName || "Activity",
	);

	return {
		fileName: sheet.fileName,
		caseKeyColumns,
		activities: timestampColumn
			? [{ name: activityName, timestampColumn }]
			: [],
		actorColumn,
	};
}

export function mergeMappingSuggestion(
	preferred: DatasetMapping,
	fallback: DatasetMapping,
): DatasetMapping {
	return {
		fileName: preferred.fileName,
		caseKeyColumns:
			preferred.caseKeyColumns.length > 0
				? preferred.caseKeyColumns
				: fallback.caseKeyColumns,
		activities:
			preferred.activities.length > 0
				? preferred.activities
				: fallback.activities,
		actorColumn: preferred.actorColumn ?? fallback.actorColumn,
	};
}
