import { sanitizeFileName } from "src/common/utils/file-name.utils";

describe("sanitizeFileName", () => {
	it.each([
		["my photo (1).png", "my-photo-1.png"],
		["Résumé Photo.JPG", "resume-photo.jpg"],
		["avatar", "avatar"],
		["???.png", "file.png"],
		["../../etc/passwd.png", "etc-passwd.png"],
	])("turns %s into %s", (input, expected) => {
		expect(sanitizeFileName(input)).toBe(expected);
	});
});
