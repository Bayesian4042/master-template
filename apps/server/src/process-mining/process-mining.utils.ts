import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { sanitizeFileName } from "../common/utils/file-name.utils";
import {
	PROCESS_MINING_UPLOAD_DIR,
	XLSX_ALLOWED_MIME_TYPES,
	XLSX_MAX_BYTES,
} from "./process-mining.constants";

export function getXlsxValidationError(file: {
	originalname: string;
	mimetype: string;
	size?: number;
}): string | null {
	const lower = file.originalname.toLowerCase();
	if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
		return "Only Excel (.xlsx) files are supported.";
	}
	if (
		!XLSX_ALLOWED_MIME_TYPES.includes(file.mimetype) &&
		!lower.endsWith(".xlsx")
	) {
		return "Unsupported file type. Upload an Excel workbook.";
	}
	if (file.size !== undefined && file.size > XLSX_MAX_BYTES) {
		return "Each file must be 15 MB or smaller.";
	}
	return null;
}

export function xlsxFileFilter(
	_request: unknown,
	file: { originalname: string; mimetype: string },
	callback: (error: Error | null, acceptFile: boolean) => void,
) {
	const validationError = getXlsxValidationError(file);
	if (validationError) {
		callback(new BadRequestException(validationError), false);
		return;
	}
	callback(null, true);
}

export function parseMappingsJson(raw: unknown): unknown {
	if (typeof raw !== "string") {
		throw new BadRequestException("mappings must be a JSON string");
	}
	try {
		return JSON.parse(raw);
	} catch {
		throw new BadRequestException("mappings is not valid JSON");
	}
}

export function saveUploadLocally(file: Express.Multer.File): string {
	mkdirSync(PROCESS_MINING_UPLOAD_DIR, { recursive: true });
	const fileName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;
	const filePath = join(PROCESS_MINING_UPLOAD_DIR, fileName);
	writeFileSync(filePath, file.buffer);
	return filePath;
}
