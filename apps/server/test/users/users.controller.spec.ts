import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { UserController } from "src/users/users.controller";
import { UserService } from "src/users/users.service";
import { avatarFileFilter } from "src/users/users.utils";

const userService = {
	uploadLogo: vi.fn(),
	removeAvatar: vi.fn(),
	getOverview: vi.fn(),
};
const session = { user: { id: "user-1" } } as UserSession;

describe("UserController", () => {
	let controller: UserController;

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{ provide: UserService, useValue: userService }],
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	it("rejects an upload without a file", async () => {
		await expect(controller.uploadLogo(session, undefined)).rejects.toThrow(
			BadRequestException,
		);
		expect(userService.uploadLogo).not.toHaveBeenCalled();
	});

	it("uploads the logo for the session user", async () => {
		const logo = { originalname: "a.png" } as Express.Multer.File;
		userService.uploadLogo.mockResolvedValue({ url: "https://s3/a.png" });

		await expect(controller.uploadLogo(session, logo)).resolves.toEqual({
			url: "https://s3/a.png",
		});
		expect(userService.uploadLogo).toHaveBeenCalledWith("user-1", logo);
	});

	it("removes the avatar for the session user", async () => {
		await controller.removeAvatar(session);
		expect(userService.removeAvatar).toHaveBeenCalledWith("user-1");
	});

	it("builds the overview from the verified session", async () => {
		const sessionWithId = {
			user: { id: "user-1", createdAt: new Date() },
			session: { id: "session-current" },
		} as unknown as UserSession;
		userService.getOverview.mockResolvedValue({ activeSessionCount: 1 });

		await expect(controller.getOverview(sessionWithId)).resolves.toEqual({
			activeSessionCount: 1,
		});
		expect(userService.getOverview).toHaveBeenCalledWith(
			sessionWithId.user,
			"session-current",
		);
	});
});

describe("avatarFileFilter", () => {
	it("accepts an allowed image type", () => {
		const callback = vi.fn();
		avatarFileFilter(null, { mimetype: "image/png" }, callback);
		expect(callback).toHaveBeenCalledWith(null, true);
	});

	it("rejects a disallowed type with a 400", () => {
		const callback = vi.fn();
		avatarFileFilter(null, { mimetype: "image/gif" }, callback);
		expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
	});
});
