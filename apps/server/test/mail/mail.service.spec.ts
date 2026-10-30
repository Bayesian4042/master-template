import { Test, TestingModule } from "@nestjs/testing";
import * as nodemailer from "nodemailer";
import { MailService } from "src/mail/mail.service";

vi.mock("nodemailer");

const mockSendMail = vi.fn();

describe("MailService", () => {
	let service: MailService;

	beforeEach(async () => {
		vi.mocked(nodemailer.createTransport).mockReturnValue({
			sendMail: mockSendMail,
		} as unknown as nodemailer.Transporter);

		const module: TestingModule = await Test.createTestingModule({
			providers: [MailService],
		}).compile();

		service = module.get<MailService>(MailService);
		mockSendMail.mockReset();
	});

	it("should return success when sendMail resolves", async () => {
		mockSendMail.mockResolvedValue({});
		const result = await service.sendMail({
			to: "test@example.com",
			subject: "Hello",
			text: "World",
		});
		expect(result).toEqual({ success: true, error: null, stack: null });
	});

	it("should return failure when sendMail throws", async () => {
		const error = new Error("SMTP failure");
		mockSendMail.mockRejectedValue(error);
		const result = await service.sendMail({
			to: "test@example.com",
			subject: "Hello",
		});
		expect(result.success).toBe(false);
		expect(result.error).toBe("SMTP failure");
		expect(result.stack).toContain("Error");
	});

	it("should pass all email options to the transporter", async () => {
		mockSendMail.mockResolvedValue({});
		await service.sendMail({
			to: ["a@example.com", "b@example.com"],
			cc: "cc@example.com",
			bcc: "bcc@example.com",
			subject: "Test",
			html: "<p>Hi</p>",
		});
		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: ["a@example.com", "b@example.com"],
				cc: "cc@example.com",
				bcc: "bcc@example.com",
				subject: "Test",
				html: "<p>Hi</p>",
			}),
		);
	});
});
