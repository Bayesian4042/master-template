import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	HttpCode,
	Post,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOkResponse } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { UserOverviewDto } from "./dto/user-overview.dto";
import { AVATAR_MAX_BYTES } from "./users.constants";
import { UserService } from "./users.service";
import { avatarFileFilter } from "./users.utils";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post("upload-logo")
	@UseInterceptors(
		FileInterceptor("logo", {
			limits: { fileSize: AVATAR_MAX_BYTES },
			fileFilter: avatarFileFilter,
		}),
	)
	@ApiConsumes("multipart/form-data")
	async uploadLogo(
		@Session() session: UserSession,
		@UploadedFile() logo?: Express.Multer.File,
	) {
		if (!logo) throw new BadRequestException("Choose an image to upload");

		return this.userService.uploadLogo(session.user.id, logo);
	}

	@Delete("avatar")
	@HttpCode(204)
	async removeAvatar(@Session() session: UserSession) {
		await this.userService.removeAvatar(session.user.id);
	}

	@Get("me/overview")
	@ApiOkResponse({ type: UserOverviewDto })
	async getOverview(@Session() session: UserSession): Promise<UserOverviewDto> {
		return this.userService.getOverview(session.user, session.session.id);
	}
}
