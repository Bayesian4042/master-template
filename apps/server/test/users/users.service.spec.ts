import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { S3Service } from "src/common/services/s3.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/users/users.service";

const s3Service = {
	uploadFile: vi.fn(),
	deleteFile: vi.fn(),
	getKeyFromUrl: vi.fn(),
};

const prisma = {
	user: { findUnique: vi.fn(), update: vi.fn() },
	session: { count: vi.fn(), findFirst: vi.fn() },
	account: { findMany: vi.fn() },
};

describe("UserService", () => {
	let service: UserService;

	beforeEach(async () => {
		vi.resetAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: S3Service, useValue: s3Service },
				{ provide: PrismaService, useValue: prisma },
			],
		}).compile();

		service = module.get<UserService>(UserService);
	});

	describe("uploadLogo", () => {
		it("uploads under a sanitized key scoped to the user", async () => {
			s3Service.uploadFile.mockResolvedValue({ key: "k", url: "https://s3/k" });
			const logo = {
				originalname: "my photo (1).png",
				mimetype: "image/png",
				size: 1024,
			} as Express.Multer.File;

			const result = await service.uploadLogo("user-1", logo);

			expect(result).toEqual({ url: "https://s3/k" });
			expect(s3Service.uploadFile).toHaveBeenCalledWith(
				logo,
				expect.stringMatching(/^master-template\/user-1\/\d+-my-photo-1\.png$/),
			);
		});
	});

	it.each([
		["a disallowed type", { mimetype: "image/gif", size: 1024 }],
		["a file over 10 MB", { mimetype: "image/png", size: 10 * 1024 * 1024 + 1 }],
	])("rejects %s without calling S3", async (_label, file) => {
		const logo = { originalname: "a", ...file } as Express.Multer.File;

		await expect(service.uploadLogo("user-1", logo)).rejects.toThrow(
			BadRequestException,
		);
		expect(s3Service.uploadFile).not.toHaveBeenCalled();
	});

	describe("removeAvatar", () => {
		it("keeps the image when the S3 delete fails", async () => {
			prisma.user.findUnique.mockResolvedValue({ image: "https://s3/own" });
			s3Service.getKeyFromUrl.mockReturnValue("master-template/user-1/1-a.png");
			s3Service.deleteFile.mockRejectedValue(
				new Error("Failed to delete file from S3"),
			);

			await expect(service.removeAvatar("user-1")).rejects.toThrow(
				"Failed to delete file from S3",
			);
			expect(prisma.user.update).not.toHaveBeenCalled();
		});

		it("deletes our S3 object and clears the image", async () => {
			prisma.user.findUnique.mockResolvedValue({ image: "https://s3/own" });
			s3Service.getKeyFromUrl.mockReturnValue("master-template/user-1/1-a.png");

			await service.removeAvatar("user-1");

			expect(s3Service.deleteFile).toHaveBeenCalledWith(
				"master-template/user-1/1-a.png",
			);
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: "user-1" },
				data: { image: null },
			});
		});

		it("skips S3 for an image outside our bucket", async () => {
			prisma.user.findUnique.mockResolvedValue({
				image: "https://lh3.googleusercontent.com/a/photo",
			});
			s3Service.getKeyFromUrl.mockReturnValue(null);

			await service.removeAvatar("user-1");

			expect(s3Service.deleteFile).not.toHaveBeenCalled();
			expect(prisma.user.update).toHaveBeenCalled();
		});

		it("never deletes another user's object", async () => {
			prisma.user.findUnique.mockResolvedValue({ image: "https://s3/other" });
			s3Service.getKeyFromUrl.mockReturnValue("master-template/user-2/1-a.png");

			await service.removeAvatar("user-1");

			expect(s3Service.deleteFile).not.toHaveBeenCalled();
		});

		it("clears the image without touching S3 when there is no image", async () => {
			prisma.user.findUnique.mockResolvedValue({ image: null });

			await service.removeAvatar("user-1");

			expect(s3Service.getKeyFromUrl).not.toHaveBeenCalled();
			expect(prisma.user.update).toHaveBeenCalled();
		});
	});

	describe("getOverview", () => {
		const user = { id: "user-1", createdAt: new Date("2026-06-10T06:38:28Z") };

		it("summarises sessions and sign-in methods for the user", async () => {
			const lastOtherSignIn = {
				createdAt: new Date("2026-09-22T18:04:11Z"),
				userAgent: "Mozilla/5.0 (iPhone)",
			};
			prisma.session.count.mockResolvedValue(2);
			prisma.session.findFirst.mockResolvedValue(lastOtherSignIn);
			prisma.account.findMany.mockResolvedValue([
				{ providerId: "credential" },
				{ providerId: "google" },
			]);

			await expect(service.getOverview(user, "session-current")).resolves.toEqual({
				memberSince: user.createdAt,
				activeSessionCount: 2,
				lastOtherSignIn,
				signInMethods: ["email", "google"],
			});
		});

		it("ignores expired sessions in both the count and the last other sign-in", async () => {
			prisma.session.count.mockResolvedValue(1);
			prisma.session.findFirst.mockResolvedValue(null);
			prisma.account.findMany.mockResolvedValue([]);

			await service.getOverview(user, "session-current");

			expect(prisma.session.count).toHaveBeenCalledWith({
				where: { userId: "user-1", expiresAt: { gt: expect.any(Date) } },
			});
			expect(prisma.session.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						userId: "user-1",
						id: { not: "session-current" },
						expiresAt: { gt: expect.any(Date) },
					},
					orderBy: { createdAt: "desc" },
				}),
			);

			const countCutoff = prisma.session.count.mock.calls[0][0].where.expiresAt.gt;
			const lastSignInCutoff =
				prisma.session.findFirst.mock.calls[0][0].where.expiresAt.gt;
			expect(lastSignInCutoff).toBe(countCutoff);
		});

		it("only reports known sign-in providers", async () => {
			prisma.session.count.mockResolvedValue(1);
			prisma.session.findFirst.mockResolvedValue(null);
			prisma.account.findMany.mockResolvedValue([
				{ providerId: "credential" },
				{ providerId: "google" },
				{ providerId: "some-internal-link" },
				{ providerId: "google" },
			]);

			const overview = await service.getOverview(user, "session-current");

			expect(overview.signInMethods).toEqual(["email", "google"]);
		});

		it("returns no other sign-in and only email when the user has one device", async () => {
			prisma.session.count.mockResolvedValue(1);
			prisma.session.findFirst.mockResolvedValue(null);
			prisma.account.findMany.mockResolvedValue([]);

			const overview = await service.getOverview(user, "session-current");

			expect(overview.lastOtherSignIn).toBeNull();
			expect(overview.signInMethods).toEqual(["email"]);
		});

		it("propagates a database failure instead of returning partial data", async () => {
			prisma.session.count.mockRejectedValue(new Error("connection lost"));
			prisma.session.findFirst.mockResolvedValue(null);
			prisma.account.findMany.mockResolvedValue([]);

			await expect(service.getOverview(user, "session-current")).rejects.toThrow(
				"connection lost",
			);
		});
	});
});
