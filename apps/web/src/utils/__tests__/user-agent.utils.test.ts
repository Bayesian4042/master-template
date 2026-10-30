import { describe, expect, it } from "vitest";
import {
	getBrowserName,
	getDeviceKind,
	getDeviceName,
} from "../user-agent.utils";

const USER_AGENTS = {
	chromeMac:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
	safariIphone:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	edgeWindows:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
	safariIpad:
		"Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	chromeAndroidTablet:
		"Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
	chromeAndroidPhone:
		"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
	chromeIos:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.6613.98 Mobile/15E148 Safari/604.1",
	firefoxLinux:
		"Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
};

describe("user-agent utils", () => {
	it.each([
		["chromeMac", "Chrome", "Mac", "desktop"],
		["safariIphone", "Safari", "Mobile Device", "mobile"],
		["edgeWindows", "Edge", "Windows PC", "desktop"],
		["safariIpad", "Safari", "Tablet", "tablet"],
		["chromeAndroidTablet", "Chrome", "Tablet", "tablet"],
		["chromeAndroidPhone", "Chrome", "Mobile Device", "mobile"],
		["chromeIos", "Chrome", "Mobile Device", "mobile"],
		["firefoxLinux", "Firefox", "Linux", "desktop"],
	] as const)("recognises %s", (key, browser, deviceName, deviceKind) => {
		const userAgent = USER_AGENTS[key];
		expect(getBrowserName(userAgent)).toBe(browser);
		expect(getDeviceName(userAgent)).toBe(deviceName);
		expect(getDeviceKind(userAgent)).toBe(deviceKind);
	});

	it("falls back for an empty or unknown user agent", () => {
		expect(getBrowserName("")).toBe("Unknown Browser");
		expect(getDeviceName("")).toBe("Desktop");
		expect(getBrowserName("curl/8.7.1")).toBe("Unknown Browser");
	});
});
