import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { config } from "src/common/config";

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: config.smtp.host,
			port: config.smtp.port,
			auth: {
				user: config.smtp.user,
				pass: config.smtp.pass,
			},
		});
	}

	async sendMail(options: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
		subject: string;
		text?: string;
		html?: string;
		attachments?: Array<{
			filename: string;
			content: Buffer | string;
		}>;
	}): Promise<{
		success: boolean;
		error: string | null;
		stack: string | null;
	}> {
		try {
			await this.transporter.sendMail({
				from: config.smtp.from,
				...options,
			});
			return {
				success: true,
				error: null,
				stack: null,
			};
		} catch (error) {
			console.error("Failed to send email:", error);
			return {
				success: false,
				error: error.message,
				stack: error.stack,
			};
		}
	}
}
