import type { CellValue } from "../process-mining.types";

export function cellToString(value: CellValue): string {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}
	return String(value).trim();
}

export function isBlank(value: CellValue): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string") return value.trim() === "";
	return false;
}

export function parseTimestamp(value: CellValue): Date | null {
	if (value === null || value === undefined) return null;

	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		const excelEpoch = Date.UTC(1899, 11, 30);
		const ms = excelEpoch + value * 86_400_000;
		const date = new Date(ms);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;

	const iso = Date.parse(trimmed);
	if (!Number.isNaN(iso)) {
		return new Date(iso);
	}

	const dayFirst =
		/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
	const match = trimmed.match(dayFirst);
	if (!match) return null;

	const day = Number(match[1]);
	const month = Number(match[2]);
	const year = Number(match[3]);
	const hour = Number(match[4] ?? 0);
	const minute = Number(match[5] ?? 0);
	const second = Number(match[6] ?? 0);

	if (month < 1 || month > 12 || day < 1 || day > 31) return null;

	const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	return Number.isNaN(date.getTime()) ? null : date;
}

export function isDateOnlyTimestamp(value: CellValue, parsed: Date): boolean {
	if (value instanceof Date) {
		return (
			parsed.getUTCHours() === 0 &&
			parsed.getUTCMinutes() === 0 &&
			parsed.getUTCSeconds() === 0 &&
			parsed.getUTCMilliseconds() === 0
		);
	}
	if (typeof value === "string") {
		return !/[T ]\d{1,2}:\d{2}/.test(value.trim());
	}
	if (typeof value === "number") {
		return Number.isInteger(value);
	}
	return false;
}

export function normalizeCaseKeyPart(value: CellValue): string | null {
	if (isBlank(value)) return null;
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}
	const parsed = parseTimestamp(value);
	if (
		parsed &&
		typeof value === "string" &&
		/^\d{1,2}[/.-]\d{1,2}[/.-]\d{4}/.test(value.trim())
	) {
		return parsed.toISOString().slice(0, 10);
	}
	return cellToString(value).toLowerCase();
}
