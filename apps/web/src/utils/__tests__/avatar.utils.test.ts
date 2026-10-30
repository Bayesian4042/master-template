import { describe, expect, it } from "vitest";
import { getAvatarFileError } from "../avatar.utils";

const createFile = (type: string, size = 1024) => {
	const file = new File(["x"], "avatar", { type });
	Object.defineProperty(file, "size", { value: size });
	return file;
};

describe("getAvatarFileError", () => {
	it("accepts an allowed image under the size limit", () => {
		expect(getAvatarFileError(createFile("image/png"))).toBeNull();
	});

	it("rejects a disallowed type", () => {
		expect(getAvatarFileError(createFile("image/gif"))).toMatch(
			/unsupported file type/i,
		);
	});

	it("rejects a file over 10 MB", () => {
		expect(
			getAvatarFileError(createFile("image/png", 10 * 1024 * 1024 + 1)),
		).toMatch(/10 MB/);
	});
});
