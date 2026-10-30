import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserOverview } from "../users.query";

const mocks = vi.hoisted(() => ({
	session: { user: { id: "user-1" } } as unknown,
	getOverview: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: { useSession: () => ({ data: mocks.session }) },
}));

vi.mock("@/services", () => ({
	UserService: { getOverview: mocks.getOverview },
}));

const setup = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	return { queryClient, ...renderHook(() => useUserOverview(), { wrapper }) };
};

describe("useUserOverview", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.session = { user: { id: "user-1" } };
		mocks.getOverview.mockResolvedValue({ activeSessionCount: 1 });
	});

	it("does not fetch without a session", () => {
		mocks.session = null;
		setup();
		expect(mocks.getOverview).not.toHaveBeenCalled();
	});

	it("does not refetch after sign-out clears the cache", async () => {
		const { queryClient, rerender } = setup();
		await waitFor(() => expect(mocks.getOverview).toHaveBeenCalledTimes(1));

		mocks.session = null;
		act(() => {
			queryClient.clear();
			rerender();
		});
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(mocks.getOverview).toHaveBeenCalledTimes(1);
	});
});
