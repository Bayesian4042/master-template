import { toSafeJobId } from "src/scheduler/scheduler.utils";

describe("toSafeJobId", () => {
	it.each([
		["welcome-42", "welcome-42"],
		["user:42", "user-42"],
		["a:b:c:d", "a-b-c-d"],
		["12345", "email-12345"],
		["-5", "email--5"],
		["42:7", "42-7"],
		["welcome-123", "welcome-123"],
	])("turns %s into %s", (input, expected) => {
		expect(toSafeJobId(input)).toBe(expected);
	});

	it("always gives the same result for the same input", () => {
		expect(toSafeJobId("user:42")).toBe(toSafeJobId("user:42"));
	});
});
