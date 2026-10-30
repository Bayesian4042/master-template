import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(dir, { recursive: true });

async function writeWorkbook(fileName, headers, rows) {
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet("Sheet1");
	sheet.addRow(headers);
	for (const row of rows) sheet.addRow(row);
	await workbook.xlsx.writeFile(join(dir, fileName));
}

await writeWorkbook(
	"mp.xlsx",
	["Location", "Svc Date", "Meal Type", "MP Submitted", "Owner"],
	[
		["Site A", "15/01/2024", "Lunch", "10/01/2024 09:00", "Priya"],
		["Site A", "15/01/2024", "Dinner", "10/01/2024 11:00", "Priya"],
		["Site B", "15/01/2024", "Lunch", "09/01/2024 16:00", "Omar"],
	],
);

await writeWorkbook(
	"mr.xlsx",
	["Location", "Svc Date", "Meal Type", "MR Submitted", "Submitted By", "Item"],
	[
		["Site A", "15/01/2024", "Lunch", "12/01/2024 09:00", "Chef", "Rice"],
		["Site A", "15/01/2024", "Lunch", "12/01/2024 09:00", "Chef", "Dal"],
		["Site A", "15/01/2024", "Dinner", "13/01/2024 10:00", "Chef", "Pasta"],
		["Site B", "15/01/2024", "Lunch", "11/01/2024 08:00", "Sous", "Soup"],
	],
);

await writeWorkbook(
	"pp.xlsx",
	["Location", "Svc Date", "Meal Type", "PP Created", "Planner"],
	[
		["Site A", "15/01/2024", "Lunch", "14/01/2024 09:00", "Ops"],
		["Site A", "15/01/2024", "Dinner", "14/01/2024 18:00", "Ops"],
		["Site B", "15/01/2024", "Lunch", "13/01/2024 12:00", "Ops"],
	],
);

console.log("Wrote mp.xlsx, mr.xlsx, pp.xlsx to", dir);
