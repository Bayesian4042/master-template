import { emailOTPTemplate } from "src/mail/templates/email-otp";
import { emailTemplateWrapper } from "src/mail/templates/wrapper";

describe("emailTemplateWrapper", () => {
	it("should wrap content in an HTML table", () => {
		const result = emailTemplateWrapper("<p>Hello</p>");
		expect(result).toContain("<p>Hello</p>");
		expect(result).toContain("<table");
		expect(result).toContain("</table>");
	});

	it("should include the Heizen footer", () => {
		const result = emailTemplateWrapper("");
		expect(result).toContain("heizen.work");
	});
});

describe("emailOTPTemplate", () => {
	it("should include the OTP code", () => {
		const result = emailOTPTemplate({ otp: "123456", validity: 10 });
		expect(result).toContain("123456");
	});

	it("should include the validity duration", () => {
		const result = emailOTPTemplate({ otp: "000000", validity: 5 });
		expect(result).toContain("5 minutes");
	});

	it("should produce a non-empty HTML string", () => {
		const result = emailOTPTemplate({ otp: "999999", validity: 15 });
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(100);
	});
});
