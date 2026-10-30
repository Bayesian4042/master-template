import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { config } from "../config";

@Injectable()
export class S3Service {
	private readonly s3Client: S3Client;
	private readonly bucket: string;
	private readonly logger = new Logger(S3Service.name);

	constructor() {
		this.s3Client = new S3Client({
			region: config.aws.s3.region,
			credentials: {
				accessKeyId: config.aws.s3.accessKeyId,
				secretAccessKey: config.aws.s3.secretAccessKey,
			},
		});
		this.bucket = config.aws.s3.bucket;
	}

	async uploadFile(
		file: Express.Multer.File,
		key: string,
	): Promise<{ key: string; url: string }> {
		try {
			const uploadCommand = new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			});

			await this.s3Client.send(uploadCommand);

			const url = this.getFileUrl(key);
			this.logger.debug(`Uploaded to S3: ${url}`);
			return { key, url };
		} catch (error) {
			this.logger.error(`Error uploading to S3: ${error}`);
			throw new Error("Failed to upload file to S3");
		}
	}

	async deleteFile(key: string): Promise<void> {
		try {
			await this.s3Client.send(
				new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
			);
			this.logger.debug(`Deleted from S3: ${key}`);
		} catch (error) {
			this.logger.error(`Error deleting from S3: ${error}`);
			throw new Error("Failed to delete file from S3");
		}
	}

	getKeyFromUrl(url: string): string | null {
		const baseUrl = this.getFileUrl("");
		return url.startsWith(baseUrl) ? url.slice(baseUrl.length) : null;
	}

	getFileUrl(key: string): string {
		return `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com/${key}`;
	}
}
