import { BadRequestException, Injectable } from "@nestjs/common";
import { analyzeMappingsSchema } from "./dto/dataset-mapping.schema";
import type { AnalyzeResponse, ProfileResponse } from "./process-mining.types";
import { parseMappingsJson, saveUploadLocally } from "./process-mining.utils";
import { ColumnMappingService } from "./services/column-mapping.service";
import { ProcessDiscoveryService } from "./services/process-discovery.service";
import { XlsxParserService } from "./services/xlsx-parser.service";
import {
	buildCoverageReport,
	coverageGateReasons,
} from "./utils/coverage.utils";
import { buildCaseEvents } from "./utils/event-log.utils";

@Injectable()
export class ProcessMiningService {
	constructor(
		private readonly xlsxParser: XlsxParserService,
		private readonly columnMapping: ColumnMappingService,
		private readonly processDiscovery: ProcessDiscoveryService,
	) {}

	async profile(files: Express.Multer.File[]): Promise<ProfileResponse> {
		this.assertFiles(files);
		this.persistUploads(files);
		const sheets = await this.xlsxParser.parseFiles(files);
		const profiles = await this.columnMapping.suggestProfiles(sheets);
		return { profiles };
	}

	async analyze(
		files: Express.Multer.File[],
		mappingsRaw: unknown,
	): Promise<AnalyzeResponse> {
		this.assertFiles(files);
		this.persistUploads(files);
		const parsedJson = parseMappingsJson(mappingsRaw);
		const { mappings } = analyzeMappingsSchema.parse(
			typeof parsedJson === "object" &&
				parsedJson !== null &&
				"mappings" in parsedJson
				? parsedJson
				: { mappings: parsedJson },
		);

		const sheets = await this.xlsxParser.parseFiles(files);
		const fileNames = new Set(sheets.map((sheet) => sheet.fileName));
		for (const mapping of mappings) {
			if (!fileNames.has(mapping.fileName)) {
				throw new BadRequestException(
					`Mapping references unknown file ${mapping.fileName}`,
				);
			}
		}

		const events = buildCaseEvents(sheets, mappings);
		const coverage = buildCoverageReport(sheets, mappings, events);
		const missing = coverageGateReasons(coverage, mappings);

		if (missing.length > 0) {
			return {
				status: "insufficient_evidence",
				missing,
				coverage,
			};
		}

		const { graph, bottleneck } = this.processDiscovery.discover(events);
		return {
			status: "ok",
			missing: [],
			coverage,
			graph,
			bottleneck,
		};
	}

	private assertFiles(files: Express.Multer.File[] | undefined) {
		if (!files || files.length === 0) {
			throw new BadRequestException("Upload at least one Excel file");
		}
	}

	private persistUploads(files: Express.Multer.File[]) {
		for (const file of files) {
			saveUploadLocally(file);
		}
	}
}
