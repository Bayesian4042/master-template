import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from "@/constants";

export const getAvatarFileError = (file: File): string | null => {
	if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type)) {
		return "Unsupported file type. Use PNG, JPEG, WebP or HEIC.";
	}
	if (file.size > AVATAR_MAX_BYTES) {
		return "Image must be 10 MB or smaller.";
	}
	return null;
};
