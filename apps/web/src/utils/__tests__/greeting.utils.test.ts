import { describe, expect, it } from "vitest";
import { getDashboardGreeting } from "../greeting.utils";

const now = new Date("2026-09-24T10:00:00Z");
const minutesAgo = (minutes: number) =>
	new Date(now.getTime() - minutes * 60 * 1000);

describe("getDashboardGreeting", () => {
	it("welcomes a new user by first name", () => {
		expect(
			getDashboardGreeting(
				{ name: "Ada Lovelace", createdAt: minutesAgo(2) },
				now,
			),
		).toBe("Welcome to Heizen, Ada 👋");
	});

	it("welcomes a new user without a name", () => {
		expect(
			getDashboardGreeting({ name: "", createdAt: minutesAgo(2) }, now),
		).toBe("Welcome to Heizen 👋");
	});

	it("welcomes back a returning user by first name", () => {
		expect(
			getDashboardGreeting(
				{ name: "  Ada   Lovelace ", createdAt: minutesAgo(60 * 24) },
				now,
			),
		).toBe("Welcome back, Ada 👋");
	});

	it("welcomes back a returning user without a name", () => {
		expect(
			getDashboardGreeting({ name: null, createdAt: minutesAgo(60) }, now),
		).toBe("Welcome back 👋");
	});

	it("treats an account older than 10 minutes as returning", () => {
		expect(
			getDashboardGreeting({ name: "Ada", createdAt: minutesAgo(10) }, now),
		).toBe("Welcome back, Ada 👋");
	});

	it("falls back when there is no session user yet", () => {
		expect(getDashboardGreeting(undefined, now)).toBe("Welcome back 👋");
	});
});
