import { extname } from "node:path";

const toSlug = (value: string) =>
	value
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const sanitizeFileName = (fileName: string) => {
	const extension = extname(fileName);
	const baseName =
		toSlug(fileName.slice(0, fileName.length - extension.length)) || "file";
	const cleanExtension = toSlug(extension);

	return cleanExtension ? `${baseName}.${cleanExtension}` : baseName;
};
