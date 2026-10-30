import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SchedulerService } from "./scheduler.service";
import { type EmailSendPayload, SCHEDULER_EVENTS } from "./scheduler.types";

@Injectable()
export class SchedulerListener {
	private readonly logger = new Logger(SchedulerListener.name);

	constructor(private readonly schedulerService: SchedulerService) {}

	@OnEvent(SCHEDULER_EVENTS.EMAIL_SEND, { async: true })
	async onEmailSend(payload: EmailSendPayload): Promise<void> {
		const { sendAt, jobId, ...emailData } = payload;
		try {
			await this.schedulerService.enqueueEmailJob(
				emailData,
				sendAt ? new Date(sendAt) : undefined,
				jobId,
			);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue email job to "${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to}": ${error}`,
			);
		}
	}
}
