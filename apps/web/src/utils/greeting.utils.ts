import { APP_NAME, NEW_ACCOUNT_WINDOW_MS } from "@/constants";

interface GreetingUser {
	name?: string | null;
	createdAt?: Date | string | null;
}

const getFirstName = (name?: string | null) =>
	name?.trim().split(/\s+/)[0] || null;

const isNewAccount = (createdAt: GreetingUser["createdAt"], now: Date) =>
	!!createdAt &&
	now.getTime() - new Date(createdAt).getTime() < NEW_ACCOUNT_WINDOW_MS;

export const getDashboardGreeting = (
	user?: GreetingUser | null,
	now = new Date(),
) => {
	const firstName = getFirstName(user?.name);

	if (isNewAccount(user?.createdAt, now)) {
		return firstName
			? `Welcome to ${APP_NAME}, ${firstName} 👋`
			: `Welcome to ${APP_NAME} 👋`;
	}

	return firstName ? `Welcome back, ${firstName} 👋` : "Welcome back 👋";
};
