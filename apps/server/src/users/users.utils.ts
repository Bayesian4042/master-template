import { BadRequestException } from "@nestjs/common";
import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from "./users.constants";

export const getAvatarValidationError = (file: {
	mimetype: string;
	size?: number;
}): string | null => {
	if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		return "Unsupported file type. Use PNG, JPEG, WebP or HEIC.";
	}
	if (file.size !== undefined && file.size > AVATAR_MAX_BYTES) {
		return "Image must be 10 MB or smaller.";
	}
	return null;
};

export const avatarFileFilter = (
	_request: unknown,
	file: { mimetype: string },
	callback: (error: Error | null, acceptFile: boolean) => void,
) => {
	const validationError = getAvatarValidationError(file);
	if (validationError) {
		callback(new BadRequestException(validationError), false);
		return;
	}

	callback(null, true);
};
