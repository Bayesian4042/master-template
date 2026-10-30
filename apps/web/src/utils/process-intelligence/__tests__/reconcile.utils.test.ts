import { describe, expect, it } from "vitest";
import {
	CMP_CASE_SERVICE_DATES,
	CMP_EVENTS,
	CMP_INITIAL_DEFINITION,
} from "@/constants/templates/cmp";
import type { ProcessDefinition } from "@/types/operations.types";
import { applyKitchenIndentResolution } from "../briefing.utils";
import { reconcileProcess } from "../reconcile.utils";

function withMrDeadline(
	definition: ProcessDefinition,
	hour: number,
): ProcessDefinition {
	return {
		...definition,
		rules: definition.rules.map((rule) =>
			rule.id === "rule-mr-deadline" && rule.kind === "deadline"
				? {
						...rule,
						hour,
						label: `Menu Requisition submitted by D-3 ${String(hour).padStart(2, "0")}:00`,
					}
				: rule,
		),
	};
}

describe("reconcileProcess", () => {
	it("builds a stable demo result from the CMP template", () => {
		const result = reconcileProcess(
			CMP_INITIAL_DEFINITION,
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);

		expect(result.cases).toHaveLength(24);
		expect(result.headline.eventsAnalysed).toBe(CMP_EVENTS.length);
		expect(result.headline.title).toMatch(/ownership differs/i);
		expect(result.headline.kind).toBe("knowledge_gap");
		expect(result.findings.length).toBeGreaterThan(0);
		expect(
			result.findings
				.filter((finding) => finding.kind === "knowledge_gap")
				.every((finding) => finding.severity !== "critical"),
		).toBe(true);
		const onTime = result.kpis.find((kpi) => kpi.id === "on-time-mr");
		expect(onTime?.value).not.toBe("24/24");
		expect(onTime?.label).toMatch(/D-3 16:00/);
		expect(result.deviations.some((d) => d.evidenceState === "confirmed")).toBe(
			true,
		);
		expect(
			result.deviations.some((d) => d.evidenceState === "insufficient_evidence"),
		).toBe(true);
		expect(
			result.deviations.some(
				(d) =>
					d.type === "quantity_variance" && d.evidenceState === "potential",
			),
		).toBe(true);
	});

	it("changes late requisition deviations when the stated cut-off moves from 16:00 to 18:00", () => {
		const at1600 = reconcileProcess(
			withMrDeadline(CMP_INITIAL_DEFINITION, 16),
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const at1800 = reconcileProcess(
			withMrDeadline(CMP_INITIAL_DEFINITION, 18),
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);

		const lateAt16 = at1600.deviations.filter(
			(d) =>
				d.type === "late" &&
				d.stepId === "mr" &&
				d.evidenceState === "confirmed",
		);
		const lateAt18 = at1800.deviations.filter(
			(d) =>
				d.type === "late" &&
				d.stepId === "mr" &&
				d.evidenceState === "confirmed",
		);

		expect(lateAt16.length).toBeGreaterThan(0);
		expect(lateAt18.length).toBeLessThan(lateAt16.length);
	});

	it("treats missing production plan as insufficient evidence, not a confirmed skip", () => {
		const result = reconcileProcess(
			CMP_INITIAL_DEFINITION,
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const missingPp = result.deviations.filter(
			(d) => d.stepId === "pp" && d.type === "missing_step",
		);
		expect(missingPp.length).toBeGreaterThan(0);
		expect(
			missingPp.every((d) => d.evidenceState === "insufficient_evidence"),
		).toBe(true);
	});

	it("reruns ownership findings when the stated owner changes", () => {
		const before = reconcileProcess(
			CMP_INITIAL_DEFINITION,
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const updated = reconcileProcess(
			applyKitchenIndentResolution(
				CMP_INITIAL_DEFINITION,
				"update_understanding",
			),
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const confirmed = reconcileProcess(
			applyKitchenIndentResolution(CMP_INITIAL_DEFINITION, "confirm_deviation"),
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const mismatches = (result: typeof before) =>
			result.deviations.filter(
				(deviation) =>
					deviation.type === "wrong_role" &&
					deviation.stepId === "ki" &&
					deviation.evidenceState === "confirmed",
			);

		expect(mismatches(before).length).toBeGreaterThan(mismatches(updated).length);
		expect(mismatches(confirmed)).toHaveLength(mismatches(before).length);
		expect(
			confirmed.findings.find((finding) => finding.stepId === "ki")?.kind,
		).toBe("process_deviation");
		expect(updated.headline.title).not.toMatch(/87\.5%/);
	});

	it("keeps headline denominators consistent with case count", () => {
		const result = reconcileProcess(
			CMP_INITIAL_DEFINITION,
			CMP_EVENTS,
			CMP_CASE_SERVICE_DATES,
		);
		const lateFinding = result.findings.find(
			(f) => f.deviationType === "late" && f.stepId === "mr",
		);
		expect(lateFinding).toBeDefined();
		expect(lateFinding?.denominator).toBe(result.cases.length);
		expect(lateFinding?.percentageOfCases).toBe(
			Math.round(
				((lateFinding?.affectedCaseIds.length ?? 0) / result.cases.length) *
					1000,
			) / 10,
		);
	});
});
