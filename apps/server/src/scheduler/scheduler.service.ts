import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_QUEUE, EmailJobData, SEND_EMAIL_JOB } from "./scheduler.types";
import { toSafeJobId } from "./scheduler.utils";

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name);

	constructor(@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue) {}

	/**
	 * Enqueues an email send job.
	 * Pass sendAt to defer delivery to a specific datetime.
	 * If sendAt is in the past or omitted the email is sent immediately.
	 * Optionally pass jobId to make the job identifiable for later updates/cancellations.
	 */
	async enqueueEmailJob(
		data: EmailJobData,
		sendAt?: Date,
		jobId?: string,
	): Promise<void> {
		const recipients = Array.isArray(data.to) ? data.to.join(", ") : data.to;
		const delay =
			sendAt && sendAt.getTime() > Date.now()
				? sendAt.getTime() - Date.now()
				: undefined;
		const safeJobId = jobId ? toSafeJobId(jobId) : undefined;

		await this.emailQueue.add(SEND_EMAIL_JOB, data, {
			removeOnComplete: { age: 1000 * 60 * 60 * 24, count: 500 },
			removeOnFail: { age: 1000 * 60 * 60 * 24 * 7, count: 200 },
			attempts: 3,
			backoff: { type: "fixed" as const, delay: 30_000 },
			...(delay ? { delay } : {}),
			...(safeJobId ? { jobId: safeJobId } : {}),
		});

		this.logger.log(
			`Enqueued email to "${recipients}" — subject: "${data.subject}"${sendAt ? ` (scheduled at: ${sendAt.toISOString()})` : ""}${safeJobId ? ` [jobId: ${safeJobId}]` : ""}`,
		);
	}
}
