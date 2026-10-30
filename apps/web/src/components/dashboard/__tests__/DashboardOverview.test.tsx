import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserOverview } from "@/types";
import { DashboardOverview } from "../DashboardOverview";

const mocks = vi.hoisted(() => ({
	useUserOverview: vi.fn(),
	refetch: vi.fn(),
	isSessionPending: false,
	sessionUser: {
		name: "Ada Lovelace",
		createdAt: new Date("2026-01-01T00:00:00Z") as Date,
	},
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		useSession: () => ({
			data: mocks.isSessionPending ? null : { user: mocks.sessionUser },
			isPending: mocks.isSessionPending,
		}),
	},
}));

vi.mock("@/queries", () => ({
	useUserOverview: mocks.useUserOverview,
}));

const overview: UserOverview = {
	memberSince: "2026-06-10T06:38:28.000Z",
	activeSessionCount: 2,
	lastOtherSignIn: {
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		userAgent:
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
	},
	signInMethods: ["email", "google"],
};

const mockQuery = (state: Record<string, unknown>) =>
	mocks.useUserOverview.mockReturnValue({
		data: undefined,
		isPending: false,
		isError: false,
		error: null,
		isFetching: false,
		refetch: mocks.refetch,
		...state,
	});

describe("DashboardOverview", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.sessionUser.createdAt = new Date("2026-01-01T00:00:00Z");
		mocks.isSessionPending = false;
	});

	it("shows a greeting skeleton instead of a guess while the session loads", () => {
		mocks.isSessionPending = true;
		mockQuery({ isPending: true });
		render(<DashboardOverview />);
		expect(screen.getByTestId("greeting-skeleton")).toBeDefined();
		expect(screen.queryByRole("heading")).toBeNull();
	});

	it("welcomes back a returning user by first name", () => {
		mockQuery({ isPending: true });
		render(<DashboardOverview />);
		expect(
			screen.getByRole("heading", { name: "Welcome back, Ada 👋" }),
		).toBeDefined();
	});

	it("welcomes a user who just signed up", () => {
		mocks.sessionUser.createdAt = new Date();
		mockQuery({ isPending: true });
		render(<DashboardOverview />);
		expect(
			screen.getByRole("heading", { name: "Welcome to Heizen, Ada 👋" }),
		).toBeDefined();
	});

	it("shows skeleton cards while loading", () => {
		mockQuery({ isPending: true });
		render(<DashboardOverview />);
		expect(screen.getAllByTestId("stat-skeleton")).toHaveLength(4);
	});

	it("shows the error and retries on click", async () => {
		mockQuery({ isError: true, error: new Error("Something went wrong") });
		render(<DashboardOverview />);

		expect(screen.getByText("Something went wrong")).toBeDefined();
		await userEvent.click(screen.getByRole("button", { name: /retry/i }));
		expect(mocks.refetch).toHaveBeenCalled();
	});

	it("renders the four stat cards from the overview", () => {
		mockQuery({ data: overview });
		render(<DashboardOverview />);

		expect(screen.getByText("Jun 2026")).toBeDefined();
		expect(screen.getByText("2 sessions")).toBeDefined();
		expect(screen.getByText("Edge on Windows PC")).toBeDefined();
		expect(screen.getByText("about 2 hours ago")).toBeDefined();
		expect(screen.getByText("Email code")).toBeDefined();
		expect(screen.getByText("Google")).toBeDefined();
	});

	it("handles a single session and an unknown user agent", () => {
		mockQuery({
			data: { ...overview, activeSessionCount: 1, lastOtherSignIn: null },
		});
		const { unmount } = render(<DashboardOverview />);
		expect(screen.getByText("1 session")).toBeDefined();
		expect(screen.getByText("Only this session")).toBeDefined();
		unmount();

		mockQuery({
			data: {
				...overview,
				lastOtherSignIn: { createdAt: overview.memberSince, userAgent: null },
			},
		});
		render(<DashboardOverview />);
		expect(screen.getByText("Unknown device")).toBeDefined();
	});
});
