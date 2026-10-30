import type { QuantityUnit } from "@/types/operations.types";

const TO_BASE: Record<
	QuantityUnit,
	{ base: "g" | "ml" | "ea"; factor: number }
> = {
	kg: { base: "g", factor: 1000 },
	g: { base: "g", factor: 1 },
	L: { base: "ml", factor: 1000 },
	ml: { base: "ml", factor: 1 },
	ea: { base: "ea", factor: 1 },
	portion: { base: "ea", factor: 1 },
};

export type NormalisedQuantity = {
	base: "g" | "ml" | "ea";
	value: number;
};

export function normaliseQuantity(
	quantity: number,
	unit: QuantityUnit,
): NormalisedQuantity {
	const mapping = TO_BASE[unit];
	return { base: mapping.base, value: quantity * mapping.factor };
}

export function quantityVariancePct(
	actualQty: number,
	actualUnit: QuantityUnit,
	expectedQty: number,
	expectedUnit: QuantityUnit,
): number | null {
	const actual = normaliseQuantity(actualQty, actualUnit);
	const expected = normaliseQuantity(expectedQty, expectedUnit);
	if (actual.base !== expected.base || expected.value === 0) return null;
	return ((actual.value - expected.value) / expected.value) * 100;
}
