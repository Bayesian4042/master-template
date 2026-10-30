import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ProcessIntakeService } from "./process-intake.service";

@ApiTags("process-intake")
@Controller("process-intake")
export class ProcessIntakeController {
	constructor(private readonly processIntakeService: ProcessIntakeService) {}

	@AllowAnonymous()
	@Post("turn")
	@ApiOkResponse({ description: "Next discovery turn and updated draft" })
	async turn(@Body() body: unknown) {
		return this.processIntakeService.turn(body);
	}
}
