import type {
	CaseEvent,
	CellValue,
	DatasetMapping,
	ParsedSheet,
} from "../process-mining.types";
import { isBlank, normalizeCaseKeyPart, parseTimestamp } from "./cell.utils";

export function buildCaseId(
	values: Record<string, CellValue>,
	caseKeyColumns: string[],
): string | null {
	const parts: string[] = [];
	for (const column of caseKeyColumns) {
		const part = normalizeCaseKeyPart(values[column] ?? null);
		if (part === null) return null;
		parts.push(part);
	}
	return parts.join("|");
}

export function buildCaseEvents(
	sheets: ParsedSheet[],
	mappings: DatasetMapping[],
): CaseEvent[] {
	const mappingByFile = new Map(mappings.map((m) => [m.fileName, m]));
	const buckets = new Map<string, CaseEvent>();

	for (const sheet of sheets) {
		const mapping = mappingByFile.get(sheet.fileName);
		if (!mapping) continue;

		for (const row of sheet.rows) {
			const caseId = buildCaseId(row.values, mapping.caseKeyColumns);
			if (!caseId) continue;

			const actor =
				mapping.actorColumn && !isBlank(row.values[mapping.actorColumn] ?? null)
					? String(row.values[mapping.actorColumn]).trim()
					: undefined;

			for (const activity of mapping.activities) {
				const raw = row.values[activity.timestampColumn] ?? null;
				const occurredAt = parseTimestamp(raw);
				if (!occurredAt) continue;

				const key = `${caseId}|${activity.name}|${occurredAt.toISOString()}`;
				const existing = buckets.get(key);
				if (existing) {
					existing.rowNumbers.push(row.rowNumber);
					if (!existing.actor && actor) existing.actor = actor;
					continue;
				}

				buckets.set(key, {
					caseId,
					activity: activity.name,
					occurredAt,
					actor,
					fileName: sheet.fileName,
					rowNumbers: [row.rowNumber],
				});
			}
		}
	}

	return Array.from(buckets.values()).sort((a, b) => {
		const caseCmp = a.caseId.localeCompare(b.caseId);
		if (caseCmp !== 0) return caseCmp;
		const timeCmp = a.occurredAt.getTime() - b.occurredAt.getTime();
		if (timeCmp !== 0) return timeCmp;
		return a.activity.localeCompare(b.activity);
	});
}

export function groupEventsByCase(
	events: CaseEvent[],
): Map<string, CaseEvent[]> {
	const byCase = new Map<string, CaseEvent[]>();
	for (const event of events) {
		const list = byCase.get(event.caseId);
		if (list) {
			list.push(event);
		} else {
			byCase.set(event.caseId, [event]);
		}
	}
	return byCase;
}
