import { BadRequestException, Injectable } from "@nestjs/common";
import { S3Service } from "src/common/services/s3.service";
import { sanitizeFileName } from "src/common/utils/file-name.utils";
import { PrismaService } from "src/prisma/prisma.service";
import type { UserOverviewDto } from "./dto/user-overview.dto";
import { AVATAR_KEY_PREFIX, SIGN_IN_PROVIDERS } from "./users.constants";
import { getAvatarValidationError } from "./users.utils";

@Injectable()
export class UserService {
	constructor(
		private readonly s3Service: S3Service,
		private readonly prisma: PrismaService,
	) {}

	async uploadLogo(userId: string, logo: Express.Multer.File) {
		const validationError = getAvatarValidationError(logo);
		if (validationError) throw new BadRequestException(validationError);

		const key = `${AVATAR_KEY_PREFIX}/${userId}/${Date.now()}-${sanitizeFileName(logo.originalname)}`;
		const { url } = await this.s3Service.uploadFile(logo, key);
		return { url };
	}

	async removeAvatar(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { image: true },
		});

		await this.deleteStoredAvatar(userId, user?.image);
		await this.prisma.user.update({
			where: { id: userId },
			data: { image: null },
		});
	}

	async deleteStoredAvatar(userId: string, imageUrl?: string | null) {
		const key = imageUrl ? this.s3Service.getKeyFromUrl(imageUrl) : null;
		if (!key?.startsWith(`${AVATAR_KEY_PREFIX}/${userId}/`)) return;

		await this.s3Service.deleteFile(key);
	}

	async getOverview(
		user: { id: string; createdAt: Date },
		currentSessionId: string,
	): Promise<UserOverviewDto> {
		const now = new Date();
		const [activeSessionCount, lastOtherSignIn, accounts] = await Promise.all([
			this.prisma.session.count({
				where: { userId: user.id, expiresAt: { gt: now } },
			}),
			this.prisma.session.findFirst({
				where: {
					userId: user.id,
					id: { not: currentSessionId },
					expiresAt: { gt: now },
				},
				orderBy: { createdAt: "desc" },
				select: { createdAt: true, userAgent: true },
			}),
			this.prisma.account.findMany({
				where: { userId: user.id },
				select: { providerId: true },
			}),
		]);

		const linkedProviders = accounts
			.map(({ providerId }) => providerId)
			.filter((providerId) => SIGN_IN_PROVIDERS.includes(providerId));

		return {
			memberSince: user.createdAt,
			activeSessionCount,
			lastOtherSignIn,
			signInMethods: [...new Set(["email", ...linkedProviders])],
		};
	}
}
