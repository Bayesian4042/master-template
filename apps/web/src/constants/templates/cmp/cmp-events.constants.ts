import type { CaseEvent, QuantityUnit } from "@/types/operations.types";
import { CMP_SITES } from "./cmp-process.constants";

const WEEKS = [
	{ label: "W01", serviceDate: "2026-01-12" },
	{ label: "W02", serviceDate: "2026-01-19" },
	{ label: "W03", serviceDate: "2026-01-26" },
	{ label: "W04", serviceDate: "2026-02-02" },
	{ label: "W05", serviceDate: "2026-02-09" },
	{ label: "W06", serviceDate: "2026-02-16" },
] as const;

type Pattern =
	| "nominal"
	| "late_mr"
	| "missing_pp"
	| "wrong_ki_role"
	| "gi_over_pp"
	| "late_mr_and_gi_over"
	| "sparse_quality";

/**
 * Planned patterns across 24 cases (4 sites × 6 weeks).
 * Counts are intentional so headline denominators stay consistent.
 */
const CASE_PATTERNS: Record<string, Pattern> = {
	"CMP-NG-W01": "nominal",
	"CMP-NG-W02": "late_mr",
	"CMP-NG-W03": "nominal",
	"CMP-NG-W04": "late_mr",
	"CMP-NG-W05": "gi_over_pp",
	"CMP-NG-W06": "late_mr_and_gi_over",
	"CMP-RP-W01": "nominal",
	"CMP-RP-W02": "wrong_ki_role",
	"CMP-RP-W03": "late_mr",
	"CMP-RP-W04": "missing_pp",
	"CMP-RP-W05": "wrong_ki_role",
	"CMP-RP-W06": "late_mr",
	"CMP-LP-W01": "nominal",
	"CMP-LP-W02": "nominal",
	"CMP-LP-W03": "missing_pp",
	"CMP-LP-W04": "gi_over_pp",
	"CMP-LP-W05": "sparse_quality",
	"CMP-LP-W06": "late_mr",
	"CMP-HP-W01": "nominal",
	"CMP-HP-W02": "wrong_ki_role",
	"CMP-HP-W03": "nominal",
	"CMP-HP-W04": "late_mr",
	"CMP-HP-W05": "missing_pp",
	"CMP-HP-W06": "gi_over_pp",
};

function hoursBefore(
	serviceDate: string,
	daysBefore: number,
	hour: number,
	minute = 0,
) {
	const d = new Date(
		`${serviceDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
	);
	d.setDate(d.getDate() - daysBefore);
	return d.toISOString();
}

function event(
	partial: Omit<CaseEvent, "values"> & { values?: CaseEvent["values"] },
): CaseEvent {
	return { values: {}, ...partial };
}

const SITE_CREW: Record<
	string,
	{ unit: string; chef: string; stores: string }
> = {
	northgate: {
		unit: "Meera Shah",
		chef: "Anil Desai",
		stores: "Northgate Stores",
	},
	riverside: {
		unit: "Ravi Kulkarni",
		chef: "Priya Nair",
		stores: "Riverside Stores",
	},
	lakeview: {
		unit: "Kavita Rao",
		chef: "Joseph Mathew",
		stores: "Lakeview Stores",
	},
	harbor: {
		unit: "Imran Qureshi",
		chef: "Leela Thomas",
		stores: "Harbor Stores",
	},
};

function buildCaseEvents(
	caseId: string,
	siteId: string,
	siteName: string,
	weekLabel: string,
	serviceDate: string,
	pattern: Pattern,
): CaseEvent[] {
	const crew = SITE_CREW[siteId] ?? {
		unit: "Unit Manager",
		chef: "Chef Manager",
		stores: "Stores Desk",
	};
	const covers = 420 + siteId.length * 17 + weekLabel.charCodeAt(2) * 3;
	const planQty = 180 + (covers % 40);
	const planUnit: QuantityUnit = "kg";
	const events: CaseEvent[] = [];

	events.push(
		event({
			id: `${caseId}-mp`,
			caseId,
			siteId,
			siteName,
			weekLabel,
			activityId: "mp",
			timestamp: hoursBefore(serviceDate, 7, 10, 0),
			actor: "Asha Menon",
			role: "Menu Planner",
			sourceRecord: { dataset: "MP", rowId: `${caseId}-MP-01` },
			values: { covers },
		}),
	);

	events.push(
		event({
			id: `${caseId}-mproj`,
			caseId,
			siteId,
			siteName,
			weekLabel,
			activityId: "mproj",
			timestamp: hoursBefore(serviceDate, 5, 14, 30),
			actor: crew.unit,
			role: "Unit Manager",
			sourceRecord: { dataset: "MP", rowId: `${caseId}-MP-02` },
			values: { covers },
		}),
	);

	const lateMr = pattern === "late_mr" || pattern === "late_mr_and_gi_over";
	// Late-for-16:00 but on-time-for-18:00 cases use D-3 17:10 so cut-off edits change findings.
	const veryLate = pattern === "late_mr_and_gi_over" || caseId.endsWith("W06");
	events.push(
		event({
			id: `${caseId}-mr`,
			caseId,
			siteId,
			siteName,
			weekLabel,
			activityId: "mr",
			timestamp: lateMr
				? veryLate
					? hoursBefore(serviceDate, 2, 11, 15)
					: hoursBefore(serviceDate, 3, 17, 10)
				: hoursBefore(serviceDate, 3, 14, 20),
			actor: crew.unit,
			role: "Unit Manager",
			sourceRecord: { dataset: "MR", rowId: `${caseId}-MR-01` },
			values: { covers, quantity: planQty, unit: planUnit },
		}),
	);

	const missingPp = pattern === "missing_pp";
	if (!missingPp) {
		events.push(
			event({
				id: `${caseId}-pp`,
				caseId,
				siteId,
				siteName,
				weekLabel,
				activityId: "pp",
				timestamp: hoursBefore(serviceDate, 2, 9, 0),
				actor: crew.chef,
				role: "Chef Manager",
				sourceRecord: { dataset: "PP", rowId: `${caseId}-PP-01` },
				values: { quantity: planQty, unit: planUnit, covers },
			}),
		);
	}

	const wrongKi = pattern === "wrong_ki_role";
	const sparse = pattern === "sparse_quality";
	events.push(
		event({
			id: `${caseId}-ki`,
			caseId,
			siteId,
			siteName,
			weekLabel,
			activityId: "ki",
			timestamp: sparse ? null : hoursBefore(serviceDate, 1, 16, 0),
			actor: sparse ? null : wrongKi ? crew.chef : crew.unit,
			role: wrongKi ? "Chef Manager" : "Unit Manager",
			sourceRecord: { dataset: "KI", rowId: `${caseId}-KI-01` },
			values: { quantity: planQty, unit: planUnit },
		}),
	);

	const giOver = pattern === "gi_over_pp" || pattern === "late_mr_and_gi_over";
	const giQty = giOver ? Math.round(planQty * 1.22) : planQty;
	const giUnit: QuantityUnit = giOver ? "g" : planUnit;
	const giNormalisedQty = giOver ? giQty : planQty;
	events.push(
		event({
			id: `${caseId}-gi`,
			caseId,
			siteId,
			siteName,
			weekLabel,
			activityId: "gi",
			timestamp: hoursBefore(serviceDate, 0, 7, 30),
			actor: crew.stores,
			role: "Stores",
			sourceRecord: { dataset: "GI", rowId: `${caseId}-GI-01` },
			values: {
				quantity: giOver ? giNormalisedQty * 1000 : giQty,
				unit: giUnit,
				cost: Math.round(giQty * 86),
			},
		}),
	);

	return events;
}

function buildAllEvents(): CaseEvent[] {
	const all: CaseEvent[] = [];
	for (const site of CMP_SITES) {
		for (const week of WEEKS) {
			const caseId = `CMP-${site.code}-${week.label}`;
			const pattern = CASE_PATTERNS[caseId] ?? "nominal";
			all.push(
				...buildCaseEvents(
					caseId,
					site.id,
					site.name,
					week.label,
					week.serviceDate,
					pattern,
				),
			);
		}
	}
	return all;
}

export const CMP_EVENTS: CaseEvent[] = buildAllEvents();

export const CMP_CASE_SERVICE_DATES: Record<string, string> =
	Object.fromEntries(
		CMP_SITES.flatMap((site) =>
			WEEKS.map((week) => [`CMP-${site.code}-${week.label}`, week.serviceDate]),
		),
	);

export const CMP_DEMO_META = {
	templateId: "cmp",
	label: "Compass Food Service — CMP demo",
	sites: CMP_SITES.map((s) => s.name),
	weeks: WEEKS.length,
	caseCount: CMP_SITES.length * WEEKS.length,
	eventCount: CMP_EVENTS.length,
	disclaimer:
		"Demo data with fictional sites and assumed process rules — not verified Compass policy.",
} as const;
