import { BullBoardQueueOptions } from "@bull-board/nestjs";

export const EMAIL_QUEUE = "emails";
export const SEND_EMAIL_JOB = "send-email";

export const QUEUES = [{ name: EMAIL_QUEUE }] as BullBoardQueueOptions[];

export const SCHEDULER_EVENTS = {
	EMAIL_SEND: "scheduler.email.send",
} as const;

export interface EmailAttachment {
	filename: string;
	content: Buffer | string;
}

export interface EmailJobData {
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	subject: string;
	text?: string;
	html?: string;
	attachments?: EmailAttachment[];
}

export interface EmailSendPayload extends EmailJobData {
	/** Optional datetime at which the email should be sent. Emails in the past are sent immediately. */
	sendAt?: Date;
	/** Optional idempotency key. Emitting again with the same jobId while the first job is still retained sends nothing. */
	jobId?: string;
}
