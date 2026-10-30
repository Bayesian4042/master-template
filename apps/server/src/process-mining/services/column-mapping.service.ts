import { createOpenAI } from "@ai-sdk/openai";
import { Injectable, Logger } from "@nestjs/common";
import { generateObject } from "ai";
import { z } from "zod";
import { config } from "../../common/config";
import { SAMPLE_ROW_LIMIT } from "../process-mining.constants";
import type {
	DatasetMapping,
	DatasetProfile,
	ParsedSheet,
} from "../process-mining.types";
import { cellToString } from "../utils/cell.utils";
import {
	mergeMappingSuggestion,
	suggestMappingFromHeaders,
} from "../utils/mapping-heuristics.utils";

const llmMappingSchema = z.object({
	mappings: z.array(
		z.object({
			fileName: z.string(),
			caseKeyColumns: z.array(z.string()),
			activities: z.array(
				z.object({
					name: z.string(),
					timestampColumn: z.string(),
				}),
			),
			actorColumn: z.string(),
		}),
	),
});

function sanitizeMapping(
	fileName: string,
	headers: string[],
	raw: {
		caseKeyColumns?: string[];
		activities?: { name: string; timestampColumn: string }[];
		actorColumn?: string;
	},
): DatasetMapping {
	const headerSet = new Set(headers);
	const caseKeyColumns = (raw.caseKeyColumns ?? []).filter((column) =>
		headerSet.has(column),
	);
	const activities = (raw.activities ?? [])
		.filter(
			(activity) =>
				activity.name.trim().length > 0 &&
				headerSet.has(activity.timestampColumn),
		)
		.map((activity) => ({
			name: activity.name.trim(),
			timestampColumn: activity.timestampColumn,
		}));
	const actorColumn =
		raw.actorColumn && headerSet.has(raw.actorColumn)
			? raw.actorColumn
			: undefined;

	return {
		fileName,
		caseKeyColumns,
		activities,
		actorColumn,
	};
}

@Injectable()
export class ColumnMappingService {
	private readonly logger = new Logger(ColumnMappingService.name);

	async suggestProfiles(sheets: ParsedSheet[]): Promise<DatasetProfile[]> {
		const suggested = await this.suggestMappings(sheets);

		return sheets.map((sheet, index) => ({
			fileName: sheet.fileName,
			sheetName: sheet.sheetName,
			rowCount: sheet.rows.length,
			headers: sheet.headers,
			sampleRows: sheet.rows.slice(0, SAMPLE_ROW_LIMIT).map((row) => {
				const sample: Record<string, string | number | boolean | null> = {};
				for (const header of sheet.headers) {
					const value = row.values[header] ?? null;
					sample[header] =
						value instanceof Date
							? value.toISOString()
							: (value as string | number | boolean | null);
				}
				return sample;
			}),
			suggestedMapping: suggested[index],
		}));
	}

	private async suggestMappings(
		sheets: ParsedSheet[],
	): Promise<DatasetMapping[]> {
		const heuristics = sheets.map((sheet) => suggestMappingFromHeaders(sheet));

		if (!config.openai.apiKey) {
			this.logger.warn("OPENAI_API_KEY missing; using header heuristics");
			return heuristics;
		}

		const payload = sheets.map((sheet) => ({
			fileName: sheet.fileName,
			headers: sheet.headers,
			sampleRows: sheet.rows.slice(0, SAMPLE_ROW_LIMIT).map((row) => {
				const sample: Record<string, string> = {};
				for (const header of sheet.headers) {
					sample[header] = cellToString(row.values[header] ?? null);
				}
				return sample;
			}),
		}));

		try {
			const openai = createOpenAI({ apiKey: config.openai.apiKey });
			const { object } = await generateObject({
				model: openai(config.openai.model),
				schema: llmMappingSchema,
				prompt: `You map CMP operational Excel columns for process mining.
For each file, identify:
1. caseKeyColumns — ordered columns that uniquely identify a case across files (prefer site/location + service date + meal type when present). Use the same conceptual order across files.
2. activities — one or more process activities represented in this file, each with a human activity name (e.g. "Menu Projection", "Menu Requisition", "Production Plan") and the timestamp column that records when that activity occurred. Prefer created/submitted/approved timestamps over plain service dates. Never use location/site/meal columns as timestamps.
3. actorColumn — optional column for the person/role who performed the activity.

Only use exact header names from the provided headers. If unsure, leave arrays empty rather than guessing badly.

Files:
${JSON.stringify(payload, null, 2)}`,
			});

			return sheets.map((sheet, index) => {
				const raw = object.mappings.find((m) => m.fileName === sheet.fileName);
				const fromLlm = sanitizeMapping(sheet.fileName, sheet.headers, {
					...(raw ?? {}),
					actorColumn: raw?.actorColumn?.trim()
						? raw.actorColumn
						: undefined,
				});
				return mergeMappingSuggestion(fromLlm, heuristics[index]);
			});
		} catch (error) {
			this.logger.warn(
				`LLM mapping failed: ${error instanceof Error ? error.message : "unknown"}`,
			);
			return heuristics;
		}
	}
}
