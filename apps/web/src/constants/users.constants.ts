export const AVATAR_ALLOWED_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp",
	"image/heic",
	"image/heif",
];

export const AVATAR_MAX_BYTES = 10 * 1024 * 1024;

export const AVATAR_ACCEPT = AVATAR_ALLOWED_MIME_TYPES.join(",");
