import { DEMO_SESSION_COOKIE } from "@/constants/demo-auth.constants";

type CookieReader = {
	get: (name: string) => { value: string } | undefined;
};

export function hasDemoSession(cookieStore: CookieReader): boolean {
	return cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1";
}
