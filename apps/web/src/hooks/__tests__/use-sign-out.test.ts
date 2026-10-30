import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignOut } from "../use-sign-out";

const mocks = vi.hoisted(() => ({
	signOut: vi.fn(),
	clear: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	toastError: vi.fn(),
	isDemo: false,
	fetch: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: { signOut: mocks.signOut },
}));

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({ clear: mocks.clear }),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("sonner", () => ({
	toast: { error: mocks.toastError },
}));

vi.mock("@/contexts/demo-auth.context", () => ({
	useIsDemoAuth: () => mocks.isDemo,
}));

describe("useSignOut", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.isDemo = false;
		vi.stubGlobal("fetch", mocks.fetch);
	});

	it("clears cached data before sending the user to sign-in", async () => {
		mocks.signOut.mockResolvedValue({ data: { success: true } });
		const { result } = renderHook(() => useSignOut());

		await act(() => result.current());

		expect(mocks.clear).toHaveBeenCalled();
		expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
		expect(mocks.refresh).toHaveBeenCalled();
		expect(mocks.clear.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.replace.mock.invocationCallOrder[0],
		);
	});

	it("keeps the cache and shows an error when sign-out fails", async () => {
		mocks.signOut.mockResolvedValue({
			data: null,
			error: { message: "Network error" },
		});
		const { result } = renderHook(() => useSignOut());

		await act(() => result.current());

		expect(mocks.toastError).toHaveBeenCalledWith("Network error");
		expect(mocks.clear).not.toHaveBeenCalled();
		expect(mocks.replace).not.toHaveBeenCalled();
	});

	it("clears the demo session without calling Better Auth", async () => {
		mocks.isDemo = true;
		mocks.fetch.mockResolvedValue({ ok: true });
		const { result } = renderHook(() => useSignOut());

		await act(() => result.current());

		expect(mocks.fetch).toHaveBeenCalledWith("/api/demo-auth", {
			method: "DELETE",
		});
		expect(mocks.signOut).not.toHaveBeenCalled();
		expect(mocks.clear).toHaveBeenCalled();
		expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
		expect(mocks.toastError).not.toHaveBeenCalled();
	});
});
