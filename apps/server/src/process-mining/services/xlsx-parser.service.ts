import { BadRequestException, Injectable } from "@nestjs/common";
import ExcelJS from "exceljs";
import type {
	CellValue,
	ParsedRow,
	ParsedSheet,
} from "../process-mining.types";

function excelCellToValue(value: ExcelJS.CellValue): CellValue {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return value;
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return value;
	}
	if (typeof value === "object") {
		if ("result" in value && value.result !== undefined) {
			return excelCellToValue(value.result as ExcelJS.CellValue);
		}
		if ("text" in value && typeof value.text === "string") {
			return value.text;
		}
		if ("richText" in value && Array.isArray(value.richText)) {
			return value.richText.map((part) => part.text).join("");
		}
		if ("sharedFormula" in value || "formula" in value) {
			return null;
		}
	}
	return String(value);
}

@Injectable()
export class XlsxParserService {
	async parseFiles(files: Express.Multer.File[]): Promise<ParsedSheet[]> {
		const sheets: ParsedSheet[] = [];
		for (const file of files) {
			sheets.push(await this.parseFile(file));
		}
		return sheets;
	}

	async parseFile(file: Express.Multer.File): Promise<ParsedSheet> {
		const workbook = new ExcelJS.Workbook();
		try {
			await workbook.xlsx.load(file.buffer as never);
		} catch {
			throw new BadRequestException(
				`Could not parse ${file.originalname}. Upload a valid .xlsx file.`,
			);
		}

		const worksheet = workbook.worksheets[0];
		if (!worksheet) {
			throw new BadRequestException(`${file.originalname} has no worksheets.`);
		}

		const headerRow = worksheet.getRow(1);
		const headers: string[] = [];
		const headerIndex = new Map<number, string>();

		headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
			const header = String(excelCellToValue(cell.value) ?? "").trim();
			if (!header) return;
			headers.push(header);
			headerIndex.set(colNumber, header);
		});

		if (headers.length === 0) {
			throw new BadRequestException(`${file.originalname} has no header row.`);
		}

		const rows: ParsedRow[] = [];
		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber === 1) return;
			const values: Record<string, CellValue> = {};
			let hasValue = false;
			for (const [colNumber, header] of headerIndex) {
				const cell = row.getCell(colNumber);
				const value = excelCellToValue(cell.value);
				values[header] = value;
				if (value !== null && value !== "") hasValue = true;
			}
			if (!hasValue) return;
			rows.push({ rowNumber, values });
		});

		return {
			fileName: file.originalname,
			sheetName: worksheet.name,
			headers,
			rows,
		};
	}
}
