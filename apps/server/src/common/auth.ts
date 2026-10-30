import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { MailService } from "src/mail/mail.service";
import { emailOTPTemplate } from "src/mail/templates";
import { config } from "./config";

const mailService = new MailService();

const adapter = new PrismaPg({
	connectionString: config.urls.db,
});

const prismaClient = new PrismaClient({
	adapter,
});

export const auth = betterAuth({
	database: prismaAdapter(prismaClient, {
		provider: "postgresql",
	}),
	trustedOrigins: config.urls.cors,
	basePath: "/api/auth",
	secret: config.betterAuthSecret,
	baseURL: config.betterAuthUrl,
	advanced: {
		database: {
			generateId: false,
			joins: true,
		},
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const subject = {
					"sign-in": "Sign In OTP",
					"email-verification": "Verify Your Email",
					"forget-password": "Reset Your Password",
				}[type];
				if (config.environment === "development") {
					console.log(`OTP: ${otp} for email: ${email}`);
				} else {
					await mailService.sendMail({
						to: email,
						subject,
						html: emailOTPTemplate({ otp, validity: 5 }),
					});
				}
			},
			otpLength: 6,
			expiresIn: 300,
			sendVerificationOnSignUp: true,
			allowedAttempts: 5,
		}),
	],
	socialProviders: {
		google: {
			clientId: config.google.clientId,
			clientSecret: config.google.clientSecret,
		},
	},
});

export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
