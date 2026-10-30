import { Module } from "@nestjs/common";
import { ProcessIntakeController } from "./process-intake.controller";
import { ProcessIntakeService } from "./process-intake.service";

@Module({
	controllers: [ProcessIntakeController],
	providers: [ProcessIntakeService],
})
export class ProcessIntakeModule {}
