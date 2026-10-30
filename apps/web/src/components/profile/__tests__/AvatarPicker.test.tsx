import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AvatarPicker } from "../AvatarPicker";

const mocks = vi.hoisted(() => ({
	uploadLogo: vi.fn(),
	updateUser: vi.fn(),
	removeAvatar: vi.fn(),
	refetch: vi.fn(),
	toastError: vi.fn(),
	toastSuccess: vi.fn(),
	user: {
		name: "Ada Lovelace",
		email: "ada@example.com",
		image: null as string | null,
	},
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		useSession: () => ({ data: { user: mocks.user }, refetch: mocks.refetch }),
	},
}));

vi.mock("@/queries", () => ({
	useUploadUserLogo: () => ({ mutate: mocks.uploadLogo, isPending: false }),
	useUpdateUser: () => ({ mutate: mocks.updateUser, isPending: false }),
	useRemoveUserAvatar: () => ({ mutate: mocks.removeAvatar, isPending: false }),
}));

vi.mock("sonner", () => ({
	toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

const pickFile = (file: File) =>
	fireEvent.change(screen.getByTestId("avatar-file-input"), {
		target: { files: [file] },
	});

describe("AvatarPicker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.user.image = null;
	});

	it("shows initials and hides Remove photo when there is no image", () => {
		render(<AvatarPicker />);
		expect(screen.getByText("AL")).toBeDefined();
		expect(screen.queryByRole("button", { name: /remove photo/i })).toBeNull();
	});

	it("rejects a disallowed file without uploading", () => {
		render(<AvatarPicker />);
		pickFile(new File(["x"], "anim.gif", { type: "image/gif" }));
		expect(mocks.toastError).toHaveBeenCalledWith(
			expect.stringMatching(/unsupported file type/i),
		);
		expect(mocks.uploadLogo).not.toHaveBeenCalled();
	});

	it("uploads a valid file, then saves the image url", () => {
		mocks.uploadLogo.mockImplementation((_file, { onSuccess }) =>
			onSuccess("https://s3/avatar.png"),
		);
		render(<AvatarPicker />);
		const file = new File(["x"], "photo.png", { type: "image/png" });

		pickFile(file);

		expect(mocks.uploadLogo).toHaveBeenCalledWith(file, expect.any(Object));
		expect(mocks.updateUser).toHaveBeenCalledWith(
			{ image: "https://s3/avatar.png" },
			expect.any(Object),
		);
	});

	it("removes the photo and refreshes the session", async () => {
		mocks.user.image = "https://s3/avatar.png";
		mocks.removeAvatar.mockImplementation((_variables, { onSuccess }) =>
			onSuccess(),
		);
		render(<AvatarPicker />);

		await userEvent.click(screen.getByRole("button", { name: /remove photo/i }));

		expect(mocks.removeAvatar).toHaveBeenCalled();
		expect(mocks.refetch).toHaveBeenCalled();
		expect(mocks.toastSuccess).toHaveBeenCalledWith("Profile picture removed");
	});
});
