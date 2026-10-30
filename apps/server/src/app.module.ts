import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { BullModule } from "@nestjs/bullmq";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { seconds, ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BullBoardAuthMiddleware } from "./bull-board.middleware";
import { auth } from "./common/auth";
import { config } from "./common/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ProcessIntakeModule } from "./process-intake/process-intake.module";
import { ProcessMiningModule } from "./process-mining/process-mining.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { QUEUES } from "./scheduler/scheduler.types";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		LoggerModule.forRoot({
			forRoutes: [{ method: RequestMethod.ALL, path: "*splat" }],
			pinoHttp: {
				transport: {
					targets: [
						{
							target: "pino-pretty",
							options: {
								colorize: true,
								singleLine: false,
								translateTime: "yyyy-mm-dd HH:MM:ss.l",
								hideObject: true,
								ignore: "pid,hostname",
								messageFormat:
									"[{req.id}] {req.method} {req.url} - {msg}  {res.statusCode} {responseTime}",
							},
						},
					],
				},
				redact: ["req.headers", "res.headers"],
				level: "debug",
				autoLogging: {
					ignore: (req) =>
						["/api/health", "/api/queues"].some((path) =>
							req.url?.startsWith(path),
						),
				},
			},
		}),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					name: "default",
					ttl: seconds(60),
					limit: 300,
				},
			],
			storage: new ThrottlerStorageRedisService({
				host: config.redis.host,
				port: config.redis.port,
				password: config.redis.password,
			}),
		}),
		EventEmitterModule.forRoot(),
		ScheduleModule.forRoot(),
		BullModule.forRoot({
			connection: {
				host: config.redis.host,
				port: config.redis.port,
				password: config.redis.password,
				tls: config.redis.host.includes("cache.amazonaws.com") ? {} : undefined,
			},
		}),
		BullBoardModule.forRoot({
			route: "/queues",
			adapter: ExpressAdapter,
		}),
		BullBoardModule.forFeature(
			...QUEUES.map((q) => ({
				name: q.name,
				adapter: BullMQAdapter,
			})),
		),
		PrismaModule,
		AuthModule.forRoot({ auth }),
		UsersModule,
		SchedulerModule,
		ProcessMiningModule,
		ProcessIntakeModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(BullBoardAuthMiddleware).forRoutes("/api/queues");
	}
}
