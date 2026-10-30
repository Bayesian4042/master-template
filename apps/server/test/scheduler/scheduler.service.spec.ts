import { getQueueToken } from "@nestjs/bullmq";
import { Test, TestingModule } from "@nestjs/testing";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { EMAIL_QUEUE, SEND_EMAIL_JOB } from "src/scheduler/scheduler.types";

const mockQueueAdd = vi.fn().mockResolvedValue({});

describe("SchedulerService", () => {
	let service: SchedulerService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SchedulerService,
				{
					provide: getQueueToken(EMAIL_QUEUE),
					useValue: { add: mockQueueAdd },
				},
			],
		}).compile();

		service = module.get<SchedulerService>(SchedulerService);
		mockQueueAdd.mockClear();
	});

	it("should enqueue an email job immediately when no sendAt given", async () => {
		await service.enqueueEmailJob({
			to: "user@example.com",
			subject: "Welcome",
			html: "<p>Hi</p>",
		});

		expect(mockQueueAdd).toHaveBeenCalledWith(
			SEND_EMAIL_JOB,
			expect.objectContaining({ to: "user@example.com", subject: "Welcome" }),
			expect.not.objectContaining({ delay: expect.anything() }),
		);
	});

	it("should enqueue with delay when sendAt is in the future", async () => {
		const future = new Date(Date.now() + 60_000);
		await service.enqueueEmailJob(
			{ to: "user@example.com", subject: "Later" },
			future,
		);

		const opts = mockQueueAdd.mock.calls[0][2];
		expect(opts.delay).toBeGreaterThan(0);
	});

	it("should enqueue immediately when sendAt is in the past", async () => {
		const past = new Date(Date.now() - 60_000);
		await service.enqueueEmailJob(
			{ to: "user@example.com", subject: "Past" },
			past,
		);

		const opts = mockQueueAdd.mock.calls[0][2];
		expect(opts.delay).toBeUndefined();
	});

	it("should include jobId in options when provided", async () => {
		await service.enqueueEmailJob(
			{ to: "user@example.com", subject: "Idempotent" },
			undefined,
			"job-123",
		);

		expect(mockQueueAdd).toHaveBeenCalledWith(
			SEND_EMAIL_JOB,
			expect.anything(),
			expect.objectContaining({ jobId: "job-123" }),
		);
	});

	it.each([
		["user:42", "user-42"],
		["12345", "email-12345"],
	])("should enqueue jobId %s as %s so BullMQ accepts it", async (jobId, expected) => {
		await service.enqueueEmailJob(
			{ to: "user@example.com", subject: "Safe id" },
			undefined,
			jobId,
		);

		expect(mockQueueAdd.mock.calls[0][2].jobId).toBe(expected);
	});

	it("should not set a jobId when none is provided", async () => {
		await service.enqueueEmailJob({ to: "u@example.com", subject: "S" });
		expect(mockQueueAdd.mock.calls[0][2]).not.toHaveProperty("jobId");
	});

	it("should configure retry policy (3 attempts, fixed backoff)", async () => {
		await service.enqueueEmailJob({ to: "u@example.com", subject: "S" });
		const opts = mockQueueAdd.mock.calls[0][2];
		expect(opts.attempts).toBe(3);
		expect(opts.backoff).toEqual({ type: "fixed", delay: 30_000 });
	});
});
