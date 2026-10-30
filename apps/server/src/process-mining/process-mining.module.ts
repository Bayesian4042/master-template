import { Module } from "@nestjs/common";
import { ProcessMiningController } from "./process-mining.controller";
import { ProcessMiningService } from "./process-mining.service";
import { ColumnMappingService } from "./services/column-mapping.service";
import { ProcessDiscoveryService } from "./services/process-discovery.service";
import { XlsxParserService } from "./services/xlsx-parser.service";

@Module({
	controllers: [ProcessMiningController],
	providers: [
		ProcessMiningService,
		XlsxParserService,
		ColumnMappingService,
		ProcessDiscoveryService,
	],
})
export class ProcessMiningModule {}
