import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "src/mail/mail.service";
import { EMAIL_QUEUE, EmailJobData, SEND_EMAIL_JOB } from "../scheduler.types";

const EMAIL_WORKER_CONCURRENCY = 8;
const EMAIL_RATE_LIMIT_MAX = 8;
const EMAIL_RATE_LIMIT_DURATION_MS = 1000;

interface SerializedBuffer {
	type: "Buffer";
	data: number[];
}

function isSerializedBuffer(value: unknown): value is SerializedBuffer {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as SerializedBuffer).type === "Buffer" &&
		Array.isArray((value as SerializedBuffer).data)
	);
}

function rehydrateBufferContent(content: unknown): Buffer | string {
	if (typeof content === "string") return content;
	if (Buffer.isBuffer(content)) return content;
	if (isSerializedBuffer(content)) return Buffer.from(content.data);
	return Buffer.from(content as ArrayBuffer);
}

@Processor(EMAIL_QUEUE, {
	concurrency: EMAIL_WORKER_CONCURRENCY,
	limiter: {
		max: EMAIL_RATE_LIMIT_MAX,
		duration: EMAIL_RATE_LIMIT_DURATION_MS,
	},
})
export class EmailProcessor extends WorkerHost {
	private readonly logger = new Logger(EmailProcessor.name);

	constructor(private readonly mailService: MailService) {
		super();
	}

	async process(job: Job<EmailJobData>): Promise<void> {
		if (job.name !== SEND_EMAIL_JOB) return;

		const { to, subject, text, html, attachments, bcc, cc } = job.data;
		const recipients = Array.isArray(to) ? to.join(", ") : to;

		await job.log(`Sending email to ${recipients} — subject: "${subject}"`);

		const rehydratedAttachments = attachments?.map((att) => ({
			filename: att.filename,
			content: rehydrateBufferContent(att.content),
		}));

		try {
			const { success, error, stack } = await this.mailService.sendMail({
				to,
				cc,
				bcc,
				subject,
				text,
				html,
				attachments: rehydratedAttachments,
			});

			if (!success) {
				throw new Error(
					`Failed to send email to ${recipients}: ${error} ${stack}`,
				);
			}

			await job.log(`Email sent successfully to ${recipients}`);
		} catch (error) {
			this.logger.error(error);
			await job.log(`ERROR [${job.id}]: ${(error as Error).message}`);
			throw error;
		}
	}
}
