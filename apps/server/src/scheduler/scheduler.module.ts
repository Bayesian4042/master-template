import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailModule } from "src/mail/mail.module";
import { EmailProcessor } from "./processors/email.processor";
import { SchedulerListener } from "./scheduler.listener";
import { SchedulerService } from "./scheduler.service";
import { QUEUES } from "./scheduler.types";

@Module({
	imports: [BullModule.registerQueue(...QUEUES), MailModule],
	providers: [SchedulerService, SchedulerListener, EmailProcessor],
})
export class SchedulerModule {}
