import { ApiProperty } from "@nestjs/swagger";

export class LastSignInDto {
	@ApiProperty()
	createdAt: Date;

	@ApiProperty({ type: String, nullable: true })
	userAgent: string | null;
}

export class UserOverviewDto {
	@ApiProperty()
	memberSince: Date;

	@ApiProperty({ example: 2 })
	activeSessionCount: number;

	@ApiProperty({ type: LastSignInDto, nullable: true })
	lastOtherSignIn: LastSignInDto | null;

	@ApiProperty({ type: [String], example: ["email", "google"] })
	signInMethods: string[];
}
