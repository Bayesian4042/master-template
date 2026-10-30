import { S3Service } from "src/common/services/s3.service";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@aws-sdk/client-s3", () => ({
	S3Client: class {
		send = mocks.send;
	},
	PutObjectCommand: class {
		constructor(public input: unknown) {}
	},
	DeleteObjectCommand: class {
		constructor(public input: unknown) {}
	},
}));

describe("S3Service", () => {
	let service: S3Service;

	beforeEach(() => {
		mocks.send.mockReset();
		service = new S3Service();
	});

	describe("getKeyFromUrl", () => {
		it("returns the key for a URL in our bucket", () => {
			const url = service.getFileUrl("master-template/user-1/1-avatar.png");
			expect(service.getKeyFromUrl(url)).toBe(
				"master-template/user-1/1-avatar.png",
			);
		});

		it("returns null for a URL outside our bucket", () => {
			expect(
				service.getKeyFromUrl("https://lh3.googleusercontent.com/a/photo"),
			).toBeNull();
		});
	});

	describe("deleteFile", () => {
		it("sends a DeleteObjectCommand for the key", async () => {
			mocks.send.mockResolvedValue({});
			await service.deleteFile("master-template/user-1/1-avatar.png");
			expect(mocks.send).toHaveBeenCalledWith(
				expect.objectContaining({
					input: expect.objectContaining({
						Key: "master-template/user-1/1-avatar.png",
					}),
				}),
			);
		});

		it("throws a generic error when S3 fails", async () => {
			mocks.send.mockRejectedValue(new Error("AccessDenied"));
			await expect(service.deleteFile("some-key")).rejects.toThrow(
				"Failed to delete file from S3",
			);
		});
	});
});
