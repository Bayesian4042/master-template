export type DeviceKind = "mobile" | "tablet" | "desktop";

export const getDeviceKind = (userAgent: string): DeviceKind => {
	const ua = userAgent.toLowerCase();
	const isAndroidTablet = ua.includes("android") && !ua.includes("mobile");

	if (ua.includes("ipad") || ua.includes("tablet") || isAndroidTablet) {
		return "tablet";
	}
	if (
		ua.includes("mobile") ||
		ua.includes("iphone") ||
		ua.includes("android")
	) {
		return "mobile";
	}
	return "desktop";
};

export const getDeviceName = (userAgent: string) => {
	const deviceKind = getDeviceKind(userAgent);
	if (deviceKind === "tablet") return "Tablet";
	if (deviceKind === "mobile") return "Mobile Device";

	const ua = userAgent.toLowerCase();
	if (ua.includes("windows")) return "Windows PC";
	if (ua.includes("mac")) return "Mac";
	if (ua.includes("linux")) return "Linux";
	return "Desktop";
};

export const getBrowserName = (userAgent: string) => {
	const ua = userAgent.toLowerCase();
	if (/edg(a|ios)?\//.test(ua)) return "Edge";
	if (ua.includes("firefox") || ua.includes("fxios")) return "Firefox";
	if (ua.includes("chrome") || ua.includes("crios")) return "Chrome";
	if (ua.includes("safari")) return "Safari";
	return "Unknown Browser";
};
