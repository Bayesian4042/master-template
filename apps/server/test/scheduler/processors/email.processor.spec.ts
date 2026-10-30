import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "src/mail/mail.service";
import { EmailProcessor } from "src/scheduler/processors/email.processor";
import { SEND_EMAIL_JOB } from "src/scheduler/scheduler.types";

const mockSendMail = vi.fn();
const mockJobLog = vi.fn().mockResolvedValue(undefined);

function makeJob(data: object, name = SEND_EMAIL_JOB) {
	return { id: "job-1", name, data, log: mockJobLog } as any;
}

describe("EmailProcessor", () => {
	let processor: EmailProcessor;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmailProcessor,
				{ provide: MailService, useValue: { sendMail: mockSendMail } },
			],
		}).compile();

		processor = module.get<EmailProcessor>(EmailProcessor);
		mockSendMail.mockReset();
		mockJobLog.mockClear();
	});

	it("should do nothing when job name is not send-email", async () => {
		await processor.process(makeJob({}, "other-job"));
		expect(mockSendMail).not.toHaveBeenCalled();
	});

	it("should send email and log success", async () => {
		mockSendMail.mockResolvedValue({ success: true, error: null, stack: null });
		await processor.process(
			makeJob({ to: "a@b.com", subject: "Hi", html: "<p>Hi</p>" }),
		);
		expect(mockSendMail).toHaveBeenCalledWith(
			expect.objectContaining({ to: "a@b.com", subject: "Hi" }),
		);
		expect(mockJobLog).toHaveBeenCalledWith(
			expect.stringContaining("sent successfully"),
		);
	});

	it("should throw when sendMail returns success=false", async () => {
		mockSendMail.mockResolvedValue({
			success: false,
			error: "SMTP error",
			stack: "stack trace",
		});
		await expect(
			processor.process(makeJob({ to: "a@b.com", subject: "Fail" })),
		).rejects.toThrow("SMTP error");
	});

	it("should throw and log when sendMail throws", async () => {
		mockSendMail.mockRejectedValue(new Error("network error"));
		await expect(
			processor.process(makeJob({ to: "a@b.com", subject: "Throw" })),
		).rejects.toThrow("network error");
		expect(mockJobLog).toHaveBeenCalledWith(expect.stringContaining("ERROR"));
	});

	it("should rehydrate buffer attachments from serialized form", async () => {
		mockSendMail.mockResolvedValue({ success: true, error: null, stack: null });
		const serialized = { type: "Buffer", data: [72, 101, 108, 108, 111] };
		await processor.process(
			makeJob({
				to: "a@b.com",
				subject: "Attach",
				attachments: [{ filename: "f.txt", content: serialized }],
			}),
		);
		const sentAttachments = mockSendMail.mock.calls[0][0].attachments;
		expect(Buffer.isBuffer(sentAttachments[0].content)).toBe(true);
		expect(sentAttachments[0].content.toString()).toBe("Hello");
	});

	it("should pass string attachments through unchanged", async () => {
		mockSendMail.mockResolvedValue({ success: true, error: null, stack: null });
		await processor.process(
			makeJob({
				to: "a@b.com",
				subject: "Attach",
				attachments: [{ filename: "f.txt", content: "plain text" }],
			}),
		);
		const sentAttachments = mockSendMail.mock.calls[0][0].attachments;
		expect(sentAttachments[0].content).toBe("plain text");
	});
});
