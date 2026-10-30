import { describe, expect, it } from "vitest";
import { normaliseQuantity, quantityVariancePct } from "../uom.utils";

describe("uom.utils", () => {
	it("normalises kg to grams", () => {
		expect(normaliseQuantity(2, "kg")).toEqual({ base: "g", value: 2000 });
	});

	it("compares GI in grams to PP in kg", () => {
		const variance = quantityVariancePct(220000, "g", 180, "kg");
		expect(variance).not.toBeNull();
		expect(variance ?? 0).toBeCloseTo(22.22, 1);
	});

	it("returns null for incompatible bases", () => {
		expect(quantityVariancePct(10, "kg", 10, "ea")).toBeNull();
	});
});
