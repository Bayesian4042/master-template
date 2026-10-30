import { join } from "node:path";

export const XLSX_MAX_BYTES = 15 * 1024 * 1024;
export const XLSX_MAX_FILES = 3;
export const XLSX_ALLOWED_MIME_TYPES = [
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-excel",
	"application/octet-stream",
];

export const PROCESS_MINING_UPLOAD_DIR = join(
	process.cwd(),
	"uploads",
	"process-mining",
);

export const SAMPLE_ROW_LIMIT = 5;
export const BOTTLENECK_LOW_SAMPLE_THRESHOLD = 10;
export const MS_PER_HOUR = 3_600_000;
