import { Module } from "@nestjs/common";
import { S3Service } from "src/common/services/s3.service";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
	imports: [],
	controllers: [UserController],
	providers: [UserService, S3Service],
	exports: [UserService],
})
export class UsersModule {}
