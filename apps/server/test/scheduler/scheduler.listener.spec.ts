import { Test, TestingModule } from "@nestjs/testing";
import { SchedulerListener } from "src/scheduler/scheduler.listener";
import { SchedulerService } from "src/scheduler/scheduler.service";

const mockEnqueueEmailJob = vi.fn().mockResolvedValue(undefined);

describe("SchedulerListener", () => {
	let listener: SchedulerListener;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SchedulerListener,
				{
					provide: SchedulerService,
					useValue: { enqueueEmailJob: mockEnqueueEmailJob },
				},
			],
		}).compile();

		listener = module.get<SchedulerListener>(SchedulerListener);
		mockEnqueueEmailJob.mockClear();
	});

	it("should enqueue email immediately when no sendAt", async () => {
		await listener.onEmailSend({ to: "a@b.com", subject: "Hi" });
		expect(mockEnqueueEmailJob).toHaveBeenCalledWith(
			{ to: "a@b.com", subject: "Hi" },
			undefined,
			undefined,
		);
	});

	it("should pass sendAt as a Date to enqueueEmailJob", async () => {
		const sendAt = new Date("2030-01-01T10:00:00Z");
		await listener.onEmailSend({ to: "a@b.com", subject: "Scheduled", sendAt });
		expect(mockEnqueueEmailJob).toHaveBeenCalledWith(
			{ to: "a@b.com", subject: "Scheduled" },
			sendAt,
			undefined,
		);
	});

	it("should forward jobId without leaving it in the email data", async () => {
		await listener.onEmailSend({
			to: "a@b.com",
			subject: "Welcome",
			jobId: "welcome-42",
		});
		expect(mockEnqueueEmailJob).toHaveBeenCalledWith(
			{ to: "a@b.com", subject: "Welcome" },
			undefined,
			"welcome-42",
		);
	});

	it("should not throw when enqueueEmailJob rejects — only log error", async () => {
		mockEnqueueEmailJob.mockRejectedValueOnce(new Error("queue down"));
		await expect(
			listener.onEmailSend({ to: "a@b.com", subject: "Fail" }),
		).resolves.not.toThrow();
	});
});
