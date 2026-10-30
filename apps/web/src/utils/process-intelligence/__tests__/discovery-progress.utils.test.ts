import { describe, expect, it } from "vitest";
import { CMP_DISCOVERY_SCRIPT } from "@/constants/templates/cmp";
import {
	formatCaptureReceipt,
	getActiveQuestionStepIds,
	getDiscoveryFacts,
} from "../discovery-progress.utils";

describe("discovery progress", () => {
	it("lists captured facts and the open pending question", () => {
		const facts = getDiscoveryFacts(
			{
				"q-mr-role": { status: "confirmed", answer: "Chef Manager" },
				"q-ki-role": { status: "skipped" },
			},
			{
				id: "q-deadline",
				prompt: "What is the MR cut-off?",
				suggestions: ["D-3 16:00"],
				field: "deadline",
			},
		);

		expect(facts.find((fact) => fact.id === "q-mr-role")?.status).toBe(
			"captured",
		);
		expect(facts.find((fact) => fact.id === "q-ki-role")?.status).toBe(
			"skipped",
		);
		expect(facts.find((fact) => fact.id === "q-deadline")?.status).toBe("open");
	});

	it("formats a capture receipt", () => {
		expect(formatCaptureReceipt("q-mr-role", "Chef Manager")).toBe(
			"Captured · Chef Manager",
		);
		expect(formatCaptureReceipt("q-steps", null)).toBe("Skipped · steps");
	});

	it("highlights the step a scripted question is about", () => {
		const sequence = CMP_DISCOVERY_SCRIPT.find((turn) => turn.id === "steps");
		const owner = CMP_DISCOVERY_SCRIPT.find((turn) => turn.id === "mr-owner");

		expect(getActiveQuestionStepIds(sequence)).toEqual([
			"mp",
			"mproj",
			"mr",
			"pp",
			"ki",
			"gi",
		]);
		expect(getActiveQuestionStepIds(owner)).toEqual(["mr"]);
		expect(getActiveQuestionStepIds(undefined)).toEqual([]);
	});
});
