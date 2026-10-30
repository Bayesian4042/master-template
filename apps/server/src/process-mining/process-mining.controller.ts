import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UploadedFiles,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ZodError } from "zod";
import { XLSX_MAX_BYTES, XLSX_MAX_FILES } from "./process-mining.constants";
import { ProcessMiningService } from "./process-mining.service";
import { xlsxFileFilter } from "./process-mining.utils";

@ApiTags("process-mining")
@Controller("process-mining")
export class ProcessMiningController {
	constructor(private readonly processMiningService: ProcessMiningService) {}

	@AllowAnonymous()
	@Post("profile")
	@UseInterceptors(
		FilesInterceptor("files", XLSX_MAX_FILES, {
			limits: { fileSize: XLSX_MAX_BYTES },
			fileFilter: xlsxFileFilter,
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				files: {
					type: "array",
					items: { type: "string", format: "binary" },
				},
			},
		},
	})
	@ApiOkResponse({ description: "Dataset profiles with suggested mappings" })
	async profile(@UploadedFiles() files: Express.Multer.File[]) {
		return this.processMiningService.profile(files);
	}

	@AllowAnonymous()
	@Post("analyze")
	@UseInterceptors(
		FilesInterceptor("files", XLSX_MAX_FILES, {
			limits: { fileSize: XLSX_MAX_BYTES },
			fileFilter: xlsxFileFilter,
		}),
	)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				files: {
					type: "array",
					items: { type: "string", format: "binary" },
				},
				mappings: { type: "string" },
			},
		},
	})
	@ApiOkResponse({ description: "Process discovery result or coverage report" })
	async analyze(
		@UploadedFiles() files: Express.Multer.File[],
		@Body("mappings") mappings: string,
	) {
		try {
			return await this.processMiningService.analyze(files, mappings);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequestException(
					error.issues.map((issue) => issue.message).join("; "),
				);
			}
			throw error;
		}
	}
}
